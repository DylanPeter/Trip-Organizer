import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { getProfile } from "../utils/profilestore";

export default function UserBadge() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const localProfile = getProfile();

  if (!isAuthenticated) {
    return (
      <button className="nav-login-btn" onClick={() => loginWithRedirect()}>
        Log in / Sign up
      </button>
    );
  }

  const avatar = localProfile.avatarUrl || user?.picture;
  const name = localProfile.name || user?.name;

  return (
    <Link to="/profile" className="nav-user-link">
      {/* ✅ NOTE: nav-avatar class here */}
      <img src={avatar} alt="avatar" className="nav-avatar" />
      <span>{name}</span>
    </Link>
  );
}