import { type Handler } from "@netlify/functions";
import * as admin from "firebase-admin";


const defaultMatchData = {
    score: { totalRuns: 0, wickets: 0, overs: 0 },
    live: { strikerId: "p1", nonStrikerId: "p2", currentBowlerId: "b1" },
    batsmen: [
        { id: "p1", name: "Player 1", runs: 0, balls: 0, status: "batting" },
        { id: "p2", name: "Player 2", runs: 0, balls: 0, status: "batting" },
        { id: "p3", name: "Player 3", runs: 0, balls: 0, status: "waiting" },
        { id: "p4", name: "Player 4", runs: 0, balls: 0, status: "waiting" },
        { id: "p5", name: "Player 5", runs: 0, balls: 0, status: "waiting" }
    ],
    bowlers: [
        { id: "b1", name: "Bowler A", overs: 0, runsConceded: 0, wickets: 0 },
        { id: "b2", name: "Bowler B", overs: 0, runsConceded: 0, wickets: 0 }
    ],
    status: "NOT_STARTED"
};


export const handler: Handler = async (event) => {
    
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
        if (!serviceAccount.project_id) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid.");
        }
        if (!admin.apps.length) {
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        }
    } catch (error: any) {
        console.error("Firebase Admin Initialization Failed:", error.message);
        return { statusCode: 500, body: JSON.stringify({ message: "Backend configuration error." }) };
    }

    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    let matchId;
    try {
        matchId = JSON.parse(event.body || '{}').matchId;
        if (!matchId) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing matchId" }) };
        }
    } catch (error) {
        return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON in request body" }) };
    }

    
    try {
        const db = admin.firestore();
        const matchRef = db.collection("matches").doc(matchId);
        
        await matchRef.set(defaultMatchData);

        console.log(`[${matchId}] Match has been reset successfully.`);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Match ${matchId} has been reset.` }),
        };

    } catch (error: any) {
        console.error(`[${matchId}] CRITICAL ERROR during reset:`, error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred while resetting the match." }),
        };
    }
};
