import React from "react";
import "./WelcomePage.css";

const WelcomePage = ({ onSignInClick, onSignUpClick }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="greeting">Welcome to</h1>
        <h2 className="app-name">🎬 StarShip</h2>
        <p className="description">
          Save your personal movie notes, rate your favorite films, and express your thoughts.
        </p>
        <p className="access-warning">
          Please sign in to access all features of the app.
        </p>

        <div className="auth-buttons">
          <button className="sign-in-btn" onClick={onSignInClick}>
            Sign In
          </button>
          <button className="sign-up-btn" onClick={onSignUpClick}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
