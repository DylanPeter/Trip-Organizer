import { NavLink, Link } from "react-router-dom";
import UserBadge from "../UserBadge"; 

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo / Brand */}
        <Link to="/" className="navbar-logo">
          <span className="brand-primary">Us</span>
          <span className="brand-secondary">Tinerary</span>
        </Link>

        {/* Nav links + UserBadge */}
        <nav className="navbar-links">
          <NavLink
            to="/trips"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Trips
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Profile
          </NavLink>

          {/* ✅ Added UserBadge here */}
          <UserBadge />
        </nav>
      </div>
    </header>
  );
}