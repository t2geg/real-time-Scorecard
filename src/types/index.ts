export interface Batsman {
  id: string;
  name: string;
  runs: number;
  balls: number;
  status: "waiting" | "batting" | "out";
}

export interface Bowler {
  id: string;
  name: string;
  runsConceded: number;
  overs: number;
  wickets: number;
}

export interface Score {
  totalRuns: number;
  wickets: number;
  overs: number;
}

export interface Live {
  strikerId: string;
  nonStrikerId: string; 
  currentBowlerId: string;
}

export interface MatchData {
  batsmen: Batsman[];
  bowlers: Bowler[];
  score: Score;
  live: Live;
  status?: "NOT_STARTED" | "COMPLETED" | "IN_PROGRESS";
}

