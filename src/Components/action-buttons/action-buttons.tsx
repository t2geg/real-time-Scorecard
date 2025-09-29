import { useState } from 'react';
import './action-buttons.css';
import { type MatchStatus } from '../../types'

interface ActionButtonsProps {
  matchId: string | undefined;
  matchStatus: MatchStatus | undefined;
}

const ActionButtons = ({ matchId, matchStatus }: ActionButtonsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleStartMatch = async () => {
    if (!matchId) {
      setError("Error: Match ID is not available.");
      return;
    }
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/.netlify/functions/startMatch-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Request failed`);
      }
      setMessage(result.message);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetMatch = async () => {
    if (!matchId) {
      setError("Error: Match ID is not available.");
      return;
    }
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/.netlify/functions/resetMatch-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Request failed`);
      }
      setMessage(result.message);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  let buttonText = '▶️ Start Match';
  let buttonAction = handleStartMatch;
  let isButtonDisabled = isLoading || matchStatus === 'IN_PROGRESS';

  if (matchStatus === 'IN_PROGRESS') {
    buttonText = 'Simulation in Progress...';
  } else if (matchStatus === 'COMPLETED' || matchStatus === 'ERROR') {
    buttonText = '🔄 Reset Match';
    buttonAction = handleResetMatch;
    isButtonDisabled = isLoading;
  }

  return (
    <div className="action-buttons-container">
      <h2>Match Controls</h2>
      <p>Start or reset the 3-over match simulation.</p>
      <button onClick={buttonAction} disabled={isButtonDisabled}>
        {buttonText}
      </button>
      
      {message && !isLoading && <p className="success-message">{message}</p>}
      {error && !isLoading && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ActionButtons;

