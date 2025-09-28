import './hero-component.css';
import ActionButtons from '../action-buttons/action-buttons';

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-image-wrapper">
        <img 
          src="https://placehold.co/600x400/2a9d8f/ffffff?text=Scorecard\nSimulator" 
          alt="Cricket match representation" 
          className="hero-image"
        />
      </div>
      <ActionButtons />
    </div>
  );
};

export default Hero;
