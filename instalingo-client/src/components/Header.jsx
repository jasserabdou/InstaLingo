import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <img src={logo} alt="Instalingo Logo" className="logo" />
          <h1>Instalingo</h1>
        </div>
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/game" className="nav-link">Game</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
        </nav>
        <div className="user-actions">
          <button className="btn btn-outline">Login</button>
          <button className="btn btn-primary">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
