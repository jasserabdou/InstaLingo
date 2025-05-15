import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import './HomePage.css';

const HomePage = () => {
  const featuredGames = [
    {
      id: 1,
      title: "Vocabulary Challenge",
      description: "Learn new words and expand your vocabulary with this fun challenge.",
      image: "https://source.unsplash.com/random/300x200/?vocabulary",
      difficulty: "Easy"
    },
    {
      id: 2,
      title: "Grammar Master",
      description: "Test your grammar skills and become a language master!",
      image: "https://source.unsplash.com/random/300x200/?grammar",
      difficulty: "Medium"
    },
    {
      id: 3,
      title: "Cultural Quiz",
      description: "Learn about different cultures and traditions through this engaging quiz.",
      image: "https://source.unsplash.com/random/300x200/?culture",
      difficulty: "Hard"
    }
  ];

  return (
    <div className="home-page">
      <Header />
      
      <section className="hero-section">
        <div className="hero-content">
          <h1>Learn Languages The Fun Way</h1>
          <p>Gamify your language learning experience with Instalingo</p>
          <Link to="/game" className="btn hero-btn">Get Started</Link>
        </div>
      </section>
      
      <section className="features-section container">
        <h2 className="section-title">Why Choose Instalingo?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Gamified Learning</h3>
            <p>Learn through fun games and challenges that make language acquisition enjoyable</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Track Progress</h3>
            <p>Monitor your improvement with detailed statistics and insights</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Compete & Win</h3>
            <p>Compete with friends and earn rewards as you master new languages</p>
          </div>
        </div>
      </section>
      
      <section className="games-section container">
        <h2 className="section-title">Featured Games</h2>
        <div className="games-grid">
          {featuredGames.map(game => (
            <GameCard 
              key={game.id}
              title={game.title}
              description={game.description}
              image={game.image}
              difficulty={game.difficulty}
              onClick={() => console.log(`Selected game: ${game.title}`)}
            />
          ))}
        </div>
        <div className="see-more">
          <Link to="/games" className="btn">See All Games</Link>
        </div>
      </section>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Instalingo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
