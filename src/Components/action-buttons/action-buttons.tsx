import { useState } from 'react';
import './action-buttons.css';

// 1. Define an interface for the props the component will receive.
interface ActionButtonsProps {
  matchId: string | undefined;
}

const ActionButtons = ({ matchId }: ActionButtonsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  // It's good practice to have a separate state for errors.
  const [error, setError] = useState(''); 

  const handleStartMatch = async () => {
    // 2. Add a safety check. If matchId hasn't been passed down yet, show an error.
    if (!matchId) {
      setError("Error: Match ID is not available yet.");
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');
    
    // 3. REMOVED: The component no longer gets the matchId itself.
    // const matchId = import.meta.env.VITE_DOCUMENT_ID;

    try {
      const response = await fetch('/.netlify/functions/startMatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 4. Use the matchId from props in the request body.
        body: JSON.stringify({ matchId }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Use the error message from the backend if it exists
        throw new Error(result.message || `Error: ${response.statusText}`);
      }

      setMessage(result.result || 'Match started successfully!');

    } catch (err: any) {
      console.error("Failed to start match:", err);
      // Update the user-facing error state
      setError(`Failed to start match: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="action-buttons-container">
      <h2>Match Controls</h2>
      <p>Start the 3-over match simulation. The results will appear in the scorecard below in real-time.</p>
      {/* 5. The button is now also disabled if the matchId prop isn't available. */}
      <button onClick={handleStartMatch} disabled={isLoading || !matchId}>
        {isLoading ? 'Simulation in Progress...' : '▶️ Start Match'}
      </button>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ActionButtons;

