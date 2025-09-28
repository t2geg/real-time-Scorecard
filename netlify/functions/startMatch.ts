import { Handler } from '@netlify/functions';
import * as admin from 'firebase-admin';

// --- Define the types for our data ---
// Using the types from your Firebase Function code
interface Batsman {
  id: string;
  name: string;
  runs: number;
  balls: number;
  status: "waiting" | "batting" | "out";
}

interface Bowler {
  id: string;
  name: string;
  runsConceded: number;
  overs: number;
  wickets: number;
}

interface Score {
  totalRuns: number;
  wickets: number;
  overs: number;
}

interface Live {
  strikerId: string;
  nonStrikerId: string; 
  currentBowlerId: string;
}

interface MatchData {
  batsmen: Batsman[];
  bowlers: Bowler[];
  score: Score;
  live: Live;
  status?: "NOT_STARTED" | "COMPLETED" | "IN_PROGRESS";
}

// --- Initialize Firebase Admin SDK ---
// This part reads the secure key from Netlify's environment variables
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const delayFunction = (timeInMilliSeconds: number): Promise<void> => new Promise(res => setTimeout(res, timeInMilliSeconds));

// --- The Main Handler for the Netlify Function ---
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { matchId } = JSON.parse(event.body || '{}');
  if (!matchId) {
    return { statusCode: 400, body: 'Missing matchId' };
  }

  const matchRef = db.collection("matches").doc(matchId) as admin.firestore.DocumentReference<MatchData>;
  
  runSimulation(matchRef, matchId);

  return {
    statusCode: 202,
    body: JSON.stringify({ message: `Match simulation started for ${matchId}` }),
  };
};


const runSimulation = async (matchRef: admin.firestore.DocumentReference<MatchData>, matchId: string) => {
    const outcomes: (number | "WICKET" | "NO_BALL" | "WIDE")[] = [0, 0, 1, 1, 2, 4, 3, 6, 6, "WICKET", "WIDE", "NO_BALL"];
    let legalBallsInOver = 0;

    // Set status to IN_PROGRESS at the beginning
    await matchRef.update({ status: "IN_PROGRESS" });

    for (let i = 0; i < 18; ) {
        const matchDoc = await matchRef.get();
        const matchData = matchDoc.data();

        if (!matchData) {
            console.error("Match document not found: ", matchId);
            return;
        }

        let { score, live, batsmen, bowlers } = matchData;

        if (legalBallsInOver === 6) {
            legalBallsInOver = 0;
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
            const [overs, balls] = String(score.overs).split('.').map(Number);
            if ((balls || 0) === 5) {
                score.overs = overs + 1;
            } else {
                score.overs = parseFloat(`${overs || 0}.${(balls || 0) + 1}`);
            }
            i++;
        }
        
        await matchRef.update({ score, live, batsmen, bowlers });
        await delayFunction(2000);
    }

    await matchRef.update({ status: "COMPLETED" });
    console.log(`Match is Over for match ID: ${matchId}`);
};

