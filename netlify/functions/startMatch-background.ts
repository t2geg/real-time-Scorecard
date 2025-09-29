import { type Handler } from "@netlify/functions";
import * as admin from "firebase-admin";


interface Batsman { id: string; name: string; runs: number; balls: number; status: "waiting" | "batting" | "out"; }
interface Bowler { id: string; name: string; runsConceded: number; overs: number; wickets: number; }
interface Score { totalRuns: number; wickets: number; overs: number; }
interface Live { strikerId: string; nonStrikerId: string; currentBowlerId: string; }
interface MatchData { batsmen: Batsman[]; bowlers: Bowler[]; score: Score; live: Live; status?: "NOT_STARTED" | "COMPLETED" | "IN_PROGRESS" | "ERROR"; }


export const handler: Handler = async (event) => {
    
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
        if (!serviceAccount.project_id) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid.");
        }
        if (!admin.apps.length) {
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            console.log("Firebase Admin SDK initialized successfully.");
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
        const matchRef = db.collection("matches").doc(matchId) as admin.firestore.DocumentReference<MatchData>;

        console.log(`[${matchId}] Starting simulation...`);
        await matchRef.update({ status: "IN_PROGRESS" });
        console.log(`[${matchId}] Status updated to IN_PROGRESS.`);

        const outcomes: (number | "WICKET" | "NO_BALL" | "WIDE")[] = [0, 0, 1, 1, 1, 1, 2, 3, 4, 4, 6, "WICKET", "WIDE", "NO_BALL","WIDE","NO_BALL"];
        let legalBallsInOver = 0;
        const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

        for (let i = 0; i < 18;) {
            const matchDoc = await matchRef.get();
            const matchData = matchDoc.data();
            if (!matchData) {
                console.error(`[${matchId}] Match document not found during simulation.`);
                throw new Error("Match data disappeared during simulation.");
            }

            let { score, live, batsmen, bowlers } = matchData;

            if (legalBallsInOver === 6) {
                legalBallsInOver = 0;
                live.currentBowlerId === bowlers[0].id ? (bowlers[0].overs++) : (bowlers[1].overs++);
                live.currentBowlerId = live.currentBowlerId === bowlers[0].id ? bowlers[1].id : bowlers[0].id;
                [live.strikerId, live.nonStrikerId] = [live.nonStrikerId, live.strikerId];
            }

            const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            let isLegalBall = true;
            const bowler = bowlers.find(p => p.id === live.currentBowlerId)!;

            if (typeof outcome === 'number') {
                const runs = outcome;
                score.totalRuns += runs;
                const striker = batsmen.find(b => b.id === live.strikerId)!;
                striker.runs += runs;
                striker.balls += 1;
                bowler.runsConceded += runs;
                if (runs % 2 !== 0) {
                    [live.strikerId, live.nonStrikerId] = [live.nonStrikerId, live.strikerId];
                }
            } else if (outcome === "WICKET") {
                score.wickets += 1;
                const striker = batsmen.find(b => b.id === live.strikerId)!;
                striker.status = 'out';
                bowler.wickets += 1;
                const nextBatsman = batsmen.find(b => b.status === "waiting");
                if (nextBatsman) {
                    nextBatsman.status = "batting";
                    live.strikerId = nextBatsman.id;
                } else {
                    i = 18;
                }
            } else if (outcome === "WIDE" || outcome === "NO_BALL") {
                score.totalRuns += 1;
                bowler.runsConceded += 1;
                isLegalBall = false;
            }

            if (isLegalBall) {
                legalBallsInOver++;
                const [over, balls] = String(score.overs).split('.').map(Number);
                if ((balls || 0) === 5) {
                    score.overs = (over || 0) + 1;
                } else {
                    score.overs = parseFloat(`${over || 0}.${(balls || 0) + 1}`);
                }
                i++;
            }
            await matchRef.update({ score, live, batsmen, bowlers });
            await delay(2000);
        }

        await matchRef.update({ status: "COMPLETED" });
        console.log(`[${matchId}] Match simulation completed successfully.`);

       
        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Match simulation completed for ${matchId}` }),
        };

    } catch (error: any) {
        console.error(`[${matchId}] CRITICAL ERROR during simulation:`, error);
    
        const db = admin.firestore();
        const matchRefOnError = db.collection("matches").doc(matchId);
        await matchRefOnError.update({ status: "ERROR" }).catch(); 
        
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred during the match simulation." }),
        };
    }
};

