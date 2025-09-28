import './hero-component.css'; 
import ActionButtons from '../action-buttons/action-buttons'


interface HeroProps {
  matchId: string | undefined;
}

const Hero = ({ matchId }: HeroProps) => {
  return (
    <div className="hero-container">
      <div className="hero-image-wrapper">
        <img 
          src="https://placehold.co/600x400/2a9d8f/ffffff?text=Scorecard\nSimulator" 
          alt="Cricket match representation" 
          className="hero-image"
        />
      </div>
      <ActionButtons matchId={matchId} />
    </div>
  );
};

export default Hero;

