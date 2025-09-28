import { useState } from 'react';
import './action-buttons.css';

const ActionButtons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleStartMatch = async () => {
    setIsLoading(true);
    setMessage('');
    const matchId = import.meta.env.VITE_DOCUMENT_ID;

    try {
      const response = await fetch('/.netlify/functions/startMatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || `Error: ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(result.result || 'Match started successfully!');

    } catch (error: any) {
      console.error("Failed to start match:", error);
      setMessage(`Failed to start match: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="action-buttons-container">
      <h2>Match Controls</h2>
      <p>Start the 3-over match simulation. The results will appear in the scorecard below in real-time.</p>
      <button onClick={handleStartMatch} disabled={isLoading}>
        {isLoading ? 'Simulation in Progress...' : '▶️ Start Match'}
      </button>
      {message && <p className="action-message">{message}</p>}
    </div>
  );
};

export default ActionButtons;
