import React from 'react';
import './GameCard.css';

const GameCard = ({ title, description, image, difficulty, onClick }) => {
  return (
    <div className="game-card" onClick={onClick}>
      <div className="game-card-image-container">
        <img src={image} alt={title} className="game-card-image" />
        <span className={`difficulty-badge difficulty-${difficulty.toLowerCase()}`}>
          {difficulty}
        </span>
      </div>
      <div className="game-card-content">
        <h3 className="game-card-title">{title}</h3>
        <p className="game-card-description">{description}</p>
        <button className="btn game-card-btn">Start Game</button>
      </div>
    </div>
  );
};

export default GameCard;
