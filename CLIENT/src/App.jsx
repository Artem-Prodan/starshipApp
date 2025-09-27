import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import WelcomePage from './WelcomePage/WelcomePage.jsx';
import { SignInModal, SignUpModal } from './ModalWindows/AuthModal.jsx';
import HomePage from './pages/homePage.jsx';

import { useCatalog, loadCatalogDataFromServer } from './context/CatalogContext';

import './splash.css';

function App() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // check flag

  const { dispatch } = useCatalog();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
    setAuthChecked(true);
  };

  const handleNicknameUpdate = (newUsername) => {
    setUser(prev => ({ ...prev, username: newUsername }));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:4000/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then(data => {
          setUser({
            username: data.nickname,
            email: data.email,
            avatarUrl: "/defaultProfLogo.jpg",
          });
          setIsLoggedIn(true);
          loadCatalogDataFromServer(dispatch);
        })
        .catch(err => {
          console.error(err);
          handleLogout();
        })
        .finally(() => {
          setAuthChecked(true); // finish auth check
        });
    } else {
      setAuthChecked(true); // finish right away if there is no token
    }
  }, []);

  // show splash until authorization confirmed
  if (!authChecked) {
    return (
      <div className="splash-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
  <Route
    path="/"
    element={
      isLoggedIn ? (
        <Navigate to="/homePage" />
      ) : (
        <div>
          <WelcomePage
            onSignInClick={() => setShowSignIn(true)}
            onSignUpClick={() => setShowSignUp(true)}
          />

          {showSignIn && (
            <SignInModal
              onClose={() => setShowSignIn(false)}
              onLoginSuccess={(userData) => {
                setUser(userData);
                setIsLoggedIn(true);
                setShowSignIn(false);
                loadCatalogDataFromServer(dispatch);
              }}
            />
          )}

          {showSignUp && (
            <SignUpModal
              onClose={() => setShowSignUp(false)}
              onRegisterSuccess={() => setShowSignUp(false)}
            />
          )}
        </div>
      )
    }
  />

  <Route
    path="homePage/*"
    element={
      isLoggedIn ? (
        <HomePage
          user={user}
          onLogout={handleLogout}
          onNicknameUpdate={handleNicknameUpdate}
        />
      ) : (
        <Navigate to="/" />
      )
    }
  />

  {/* redirect to catalog */}
  <Route path="*" element={<Navigate to="/homePage/catalog" replace />} />
</Routes>

    </Router>
  );
}

export default App;
