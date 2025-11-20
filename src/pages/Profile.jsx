import React, { useEffect, useState } from "react";
import { getProfile, saveProfile } from "../utils/profilestore";
import { getTrips } from "../utils/tripstore";
import "../styles/Profile.css";
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "../components/NavBar/NavBar.jsx";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, isLoading, isAuthenticated, logout } = useAuth0();

  // initial form: prefer saved profile, fall back to Auth0
  const [form, setForm] = useState(() => {
    const base = getProfile();
    return {
      ...base,
      name: base.name || user?.name || "",
      email: base.email || user?.email || "",
      avatarUrl: base.avatarUrl || user?.picture || "",
    };
  });

  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(
    form.avatarUrl || user?.picture || ""
  );
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);

  function formatTripDates(trip) {
    if (!trip.dateStart && !trip.dateEnd) return "Dates not set";
    const start = trip.dateStart ? new Date(trip.dateStart) : null;
    const end = trip.dateEnd ? new Date(trip.dateEnd) : null;
    const fmt = (d) =>
      d?.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    if (start && end) return `${fmt(start)} – ${fmt(end)}`;
    if (start) return fmt(start);
    if (end) return fmt(end);
    return "Dates not set";
  }

  function splitTrips() {
    const all = getTrips ? getTrips() : [];
    const now = new Date();

    const upcoming = [];
    const past = [];

    all.forEach((trip) => {
      const end = trip.dateEnd
        ? new Date(trip.dateEnd)
        : trip.dateStart
        ? new Date(trip.dateStart)
        : null;

      if (!end || isNaN(end)) {
        upcoming.push(trip);
        return;
      }

      if (end >= now) upcoming.push(trip);
      else past.push(trip);
    });

    const sortByStart = (a, b) =>
      new Date(a.dateStart || a.dateEnd) -
      new Date(b.dateStart || b.dateEnd);
    const sortByEndDesc = (a, b) =>
      new Date(b.dateEnd || b.dateStart) -
      new Date(a.dateEnd || a.dateStart);

    setUpcomingTrips(upcoming.sort(sortByStart));
    setPastTrips(past.sort(sortByEndDesc));
  }

  // keep avatar in sync with Auth0 only if we don't already have one
  useEffect(() => {
    if (user?.picture) {
      setForm((f) => ({
        ...f,
        avatarUrl: f.avatarUrl || user.picture,
      }));
      setPreview((p) => p || user.picture);
    }
  }, [user]);

  // run on mount + listen for storage changes
  useEffect(() => {
    splitTrips();

    const onStorage = (e) => {
      if (e.key === "profile.v1") {
        setForm(getProfile());
      }
      if (e.key === "trips.v1") {
        splitTrips();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);

    const reader = new FileReader();
    reader.onload = () =>
      setForm((f) => ({ ...f, avatarUrl: reader.result || "" }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    setSaving(true);
    const current = getProfile();
    const merged = { ...current, ...form };
    saveProfile(merged);
    setForm(merged);
    setTimeout(() => setSaving(false), 250);
  };

  if (isLoading) {
    return (
      <>
        <NavBar />
        <div
          className="profile-loader"
          style={{ padding: "2rem", textAlign: "center" }}
        >
          Loading profile…
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="profile-layout">
        {/* LEFT: profile card */}
        <section className="profile-page">
          <div className="profile-avatar-block">
            <img
              src={
                preview ||
                form.avatarUrl ||
                "https://via.placeholder.com/140?text=Avatar"
              }
              alt="avatar"
              className="profile-avatar-large"
            />

            <label className="cursor-pointer profile-avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={onAvatar}
                hidden
              />
              Upload Avatar
            </label>
          </div>

          <h1 className="profile-name">
            {form.name || user?.name || "My Profile"}
          </h1>
          <p className="profile-email">
            {form.email || user?.email || "Add your email"}
          </p>

          {isAuthenticated && (
            <button
              className="profile-logout-btn"
              onClick={() =>
                logout({
                  logoutParams: { returnTo: window.location.origin },
                })
              }
            >
              Log Out
            </button>
          )}

          <div className="profile-form">
            <label>
              <span>Name</span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
              />
            </label>

            <label>
              <span>Email</span>
              <input
                name="email"
                value={form.email || ""}
                onChange={onChange}
                placeholder="you@example.com"
              />
            </label>

            <label>
              <span>Bio</span>
              <textarea
                rows={4}
                name="bio"
                value={form.bio || ""}
                onChange={onChange}
                placeholder="Tell people about you…"
                className="bio-input"
              />
            </label>

            <button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </section>

        {/* RIGHT: actions + trips */}
        <section className="profile-right">
          {/* QUICK ACTIONS */}
          <div className="profile-actions">
            <h2>Your Actions</h2>
            <div className="profile-actions-buttons">
              <button
                onClick={() => (window.location.href = "/trips/new")}
              >
                Create New Trip
              </button>
              <button
                onClick={() => (window.location.href = "/trips")}
              >
                View All Trips
              </button>
            </div>
          </div>

          {/* TRIP LISTS */}
          <div className="profile-trips">
            <h2>Your Trips</h2>

            {/* Upcoming */}
            <div className="profile-trips-group">
              <h3>Upcoming Trips</h3>
              {upcomingTrips.length === 0 ? (
                <p className="profile-trips-empty">
                  No upcoming trips yet.{" "}
                  <Link to="/trips/new">Start a new trip</Link>.
                </p>
              ) : (
                <div className="profile-trip-list">
                  {upcomingTrips.map((trip) => (
                    <div className="profile-trip-card" key={trip.id}>
                      <div>
                        <h4>{trip.name || "Untitled Trip"}</h4>
                        <p className="profile-trip-location">
                          {trip.location ||
                            trip.city ||
                            "Location not set"}
                        </p>
                        <p className="profile-trip-dates">
                          {formatTripDates(trip)}
                        </p>
                      </div>
                      <Link
                        to={`/trips/${trip.id}`}
                        className="profile-trip-view"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            <div className="profile-trips-group">
              <h3>Past Trips</h3>
              {pastTrips.length === 0 ? (
                <p className="profile-trips-empty">
                  No past trips yet.
                </p>
              ) : (
                <div className="profile-trip-list">
                  {pastTrips.map((trip) => (
                    <div className="profile-trip-card" key={trip.id}>
                      <div>
                        <h4>{trip.name || "Untitled Trip"}</h4>
                        <p className="profile-trip-location">
                          {trip.location ||
                            trip.city ||
                            "Location not set"}
                        </p>
                        <p className="profile-trip-dates">
                          {formatTripDates(trip)}
                        </p>
                      </div>
                      <Link
                        to={`/trips/${trip.id}`}
                        className="profile-trip-view"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}