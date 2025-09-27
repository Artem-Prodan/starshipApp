// ./components/Wheader.jsx


import React from 'react';
import './catHeader.css';

const WatchlistHeader = ({ scrollY = 0, scrollDirection = null }) => {
  const scale = scrollDirection === 'down' ? 1 : 1.3;
  const translateY = scrollDirection === 'up' && scrollY < 100
    ? (100 - scrollY) * 0.05
    : 0;

  const transitionStyle = 'transform 0.5s ease, opacity 0.3s ease';

  return (
    <div
      className="catalog-animation-wrapper"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: `${Math.max(1 - scrollY / 200, 0)}`,
        transition: transitionStyle,
        textAlign: 'center',
        marginTop: '80px',
      }}
    >
      <h1 className="catalog-title">Watchlist</h1>
    </div>
  );
};

export default WatchlistHeader;
