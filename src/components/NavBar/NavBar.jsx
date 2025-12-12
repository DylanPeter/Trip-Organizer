import { NavLink, Link } from "react-router-dom";
import UserBadge from "../UserBadge";
import "../../styles/NavBar.css";
import logo from "../../assets/ustinerary-logo.png";
// 👇 NEW: import the switcher
import TestUserSwitcher from "./TestUserSwitcher";

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          {/* <span className="brand-primary">Us</span>
          <span className="brand-secondary">Tinerary</span> */}
          <img 
            src={logo}
            alt="usTinerary logo" 
            className="logo"
          />
        </Link>

        {/* Links */}
        <nav className="navbar-links">
          <NavLink
            to="/trips"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            Trips
          </NavLink>

          {/* <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            Profile
          </NavLink> */}

          {/* 👇 Test user dropdown for collaboration testing */}
          <TestUserSwitcher />

          {/* Auth + avatar handled ONLY here */}
          <UserBadge />
        </nav>
      </div>
    </header>
  );
}
