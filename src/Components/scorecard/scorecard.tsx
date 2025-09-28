import { type MatchData} from '../../types'
import './scorecard.css';



interface ScorecardProps {
  matchData: MatchData | null;
}

const Scorecard = ({ matchData }: ScorecardProps) => {
  // If there's no match data yet, show a default message
  if (!matchData) {
    return <div className="scorecard-container">Awaiting match start...</div>;
  }

  const { score, batsmen, bowlers, live, status } = matchData;

  // Find the player objects based on their IDs from the 'live' data
  const striker = batsmen.find(b => b.id === live.strikerId);
  const nonStriker = batsmen.find(b => b.id === live.nonStrikerId);
  const bowler = bowlers.find(b => b.id === live.currentBowlerId);

  // A helper to format the status text (e.g., "NOT_STARTED" -> "NOT STARTED")
  const formattedStatus = status?.replace('_', ' ') || 'NOT STARTED';

  return (
    <div className="scorecard-container">
      <div className="main-score">
        <h1>{score.totalRuns} - {score.wickets}</h1>
        <p>Overs: {score.overs}</p>
        <div className={`status-badge status-${status?.replace('_', '-')}`}>
          {formattedStatus}
        </div>
      </div>
      <div className="player-details">
        <div className="batsmen-card">
          <h3>On Strike</h3>
          <p>
            <strong>{striker?.name}*</strong>
          </p>
          <p className="player-stats">{striker?.runs} ({striker?.balls})</p>
        </div>
        <div className="batsmen-card">
          <h3>Non-Striker</h3>
          <p>
            <strong>{nonStriker?.name}</strong>
          </p>
          <p className="player-stats">{nonStriker?.runs} ({nonStriker?.balls})</p>
        </div>
        <div className="bowler-card">
          <h3>Current Bowler</h3>
          <p>
            <strong>{bowler?.name}</strong>
          </p>
          <p className="player-stats">{bowler?.wickets}/{bowler?.runsConceded} ({bowler?.overs})</p>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;

