// pages/components/navBar.jsx

import { NavLink } from "react-router-dom";
import './navBar.css';

export default function NavBar({ username, avatarUrl, onProfClick }) {
  return (
    <div className="navbar">

      <div className="navbar-left">
        <img src={avatarUrl} alt="avatar" className="avatar" />
        <div>
          <span className="username">{username}</span>
          <span className="profile-link" onClick={onProfClick}>My profile</span>
        </div>
      </div>


      <div className="navbar-right">
       
        <NavLink to="/HomePage/catalog"
         className={({ isActive }) => `tab ${isActive ? 'active-tab' : ''}`}
        > Catalog</NavLink>

        <NavLink to="/HomePage/my-picks"
         className={({ isActive }) => `tab ${isActive ? 'active-tab' : ''}`}
        > My Picks</NavLink>

        <NavLink to="/HomePage/watchlist"
         className={({ isActive }) => `tab ${isActive ? 'active-tab' : ''}`}
        > Watchlist</NavLink>
      </div>
    </div>
  );
}