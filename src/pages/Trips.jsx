import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTrips, createTrip, deleteTrip, renameTrip } from "../utils/tripstore";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

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

  const handleCreate = () => {
    const id = createTrip({ name: "New Trip" });
    setTrips(getTrips());
    navigate(`/trips/${id}`);
  };

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
      <div className="trips-header">
        <h1>Your Trips</h1>
        <button onClick={handleCreate} className="cta-btn">+ Create Trip</button>
      </div>

      {trips.length === 0 ? (
        <div className="feature-card empty-state">
          <p>You don’t have any trips yet.</p>
          <button onClick={handleCreate} className="cta-btn">Create your first trip</button>
        </div>
      ) : (
        <ul className="trip-list">
          {trips
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((t) => (
              <li key={t.id} className="feature-card trip-item">
                <div className="trip-top">
                  <div className="trip-info">
                    <Link to={`/trips/${t.id}`} className="trip-name">
                      {t.name}
                    </Link>
                    <p className="trip-date">
                      Created {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="trip-actions">
                    <button
                      onClick={() => handleRename(t.id, t.name)}
                      className="nav-item rename-btn"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="nav-item delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="trip-bottom">
                  <Link to={`/trips/${t.id}`} className="trip-link">
                    Open checklist →
                  </Link>
                </div>
              </li>
            ))}
        </ul>
      )}
    </main>
  );
}
