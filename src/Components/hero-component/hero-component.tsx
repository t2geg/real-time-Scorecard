import ActionButtons from '../action-buttons/action-buttons';
import './hero-component.css';
import { type MatchStatus } from '../../types';

interface HeroProps {
  matchId: string | undefined;
  matchStatus: MatchStatus | undefined;
}

const Hero = ({ matchId, matchStatus }: HeroProps) => {
  return (
    <div className="hero-container">
      <div className="hero-image-wrapper">
        <img 
          src="https://placehold.co/600x400/2a9d8f/ffffff?text=Scorecard\nSimulator" 
          alt="Cricket match representation" 
          className="hero-image"
        />
      </div>
      <ActionButtons matchId={matchId} matchStatus={matchStatus} />
    </div>
  );
};

export default Hero;
