import { useEffect, useState } from 'react'

import './App.css'
import { db } from './firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

interface Score{
  overs:number,
  totalRuns: number,
  wickets:number
}

interface MatchData{
  score:Score
}

function App() {

  const [matchData, setmatchData]= useState<MatchData | null>(null);
  const[isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    const matchId = import.meta.env.VITE_DOCUMENT_ID;
    const docRef = doc(db,'matches',matchId);

    const unsubscribe = onSnapshot(docRef, (docSnap)=>{
      if(docSnap.exists()){
        setmatchData(docSnap.data() as MatchData)
      }
      else {
        console.log('No such document');
      }
      setIsLoading(false);
    })

    return () => unsubscribe();
  },[])

  if(isLoading){
    return(
      <div>
        LOading match data........
      </div>
    )
  }
  if(!matchData){
    return <div>No ScoreCard Found Please check</div>
  }

  return (
    <>
      <div className="App">
        <h1>Live Match Scorecard</h1>
        <div className="scoreCard">
          <h2 className="score">Score: {matchData.score.totalRuns} / Wickets: {matchData.score.wickets}</h2>
          <p className='overs'>Overs: {matchData.score.overs}</p>
        </div>
      </div>
    </>
  )
}

export default App
