import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { type MatchData } from './types';

import Navbar from './Components/NavBar/Navbar';
import Hero from './Components/hero-component/hero-component'
import Scorecard from './Components/scorecard/scorecard';

import './App.css';

function App() {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const matchId = import.meta.env.VITE_MATCH_ID;

  useEffect(() => {
    if (!matchId) {
      console.error("VITE_MATCH_ID environment variable not found!");
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, 'matches', matchId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMatchData(docSnap.data() as MatchData);
      } else {
        console.log("No such document with that ID!");
      }
      setIsLoading(false);
    });

    
    return () => unsubscribe();
  }, [matchId]); 

  if (isLoading) {
    return <div className="loading-screen">Loading Live Scorecard...</div>;
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Hero matchId={matchId} />
      </main>
      <Scorecard matchData={matchData} />
    </div>
  );
}

export default App;

