import { NavLink, Link } from "react-router-dom";
import UserBadge from "../UserBadge";
import { useAuth0 } from "@auth0/auth0-react";

export default function NavBar() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="brand-primary">Us</span>
          <span className="brand-secondary">Tinerary</span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/trips" className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}>Trips</NavLink>
          <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}>Profile</NavLink>

          <UserBadge />

          {!isAuthenticated ? (
            <button className="nav-item" onClick={() => loginWithRedirect()}>
              Log in / Sign up
            </button>
          ) : (
            <button
              className="nav-item"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            > 
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}