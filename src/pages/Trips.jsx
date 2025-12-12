import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTrips, createTrip, deleteTrip, renameTrip } from "../utils/tripstore";
import "../styles/Trips.css"

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  const goToCreate = () => navigate("/trips/new");

  useEffect(() => {
    setTrips(getTrips());
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "trips.v1") setTrips(getTrips());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleDelete = (id) => {
    if (!confirm("Delete this trip?")) return;
    deleteTrip(id);
    setTrips(getTrips());
  };

  const handleRename = (id, current) => {
    const name = prompt("Trip name:", current);
    if (name && name.trim()) {
      renameTrip(id, name.trim());
      setTrips(getTrips());
    }
  };

  return (
    <main className="trips-page">
      <div className="trips-inner">
        <div className="trips-header">
          <h1>Your Trips</h1>
          <button onClick={goToCreate} className="cta-btn">
            + Create Trip
          </button>
        </div>
        {trips.length === 0 ? (
          <div className="feature-card empty-state">
            <p>You don’t have any trips yet.</p>
            <button onClick={goToCreate} className="cta-btn">
              Create your first trip
            </button>
          </div>
        ) : (
          <ul className="trip-list">
            {trips
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((t) => (
                <li
                  key={t.id}
                  className="trip-card"
                  style={{
                    backgroundImage: t.photoUrl ? `url(${t.photoUrl})` : "none"
                  }}
                >
                  <Link
                    to={`/trips/${t.id}`}
                    className="trip-card-clickarea"
                  ></Link>
                  <div className="trip-card-footer">
                    <span className="trip-card-title">
                      {t.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDelete(t.id)
                      }}
                      className="trip-card-delete"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </main>
  );
}