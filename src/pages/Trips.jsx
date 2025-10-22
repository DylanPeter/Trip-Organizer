import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTrips, createTrip, deleteTrip, renameTrip } from "../utils/tripStore";

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
    <main className="trips-page" style={{ maxWidth: 1000, margin: "0 auto", padding: "2.5rem 1rem" }}>
      <div className="trips-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 className="text-2xl" style={{ margin: 0 }}>
          Your Trips
        </h1>
        <button onClick={goToCreate} className="cta-btn">
          + Create Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="feature-card empty-state">
          <p style={{ marginBottom: "0.75rem" }}>You don’t have any trips yet.</p>
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
              <li key={t.id} className="feature-card trip-item">
                <div className="trip-top">
                  <div className="trip-info">
                    <Link to={`/trips/${t.id}`} className="trip-name">
                      {t.name}
                    </Link>
                    <p className="text-xs" style={{ opacity: 0.8 }}>
                      {t.location ? `${t.location} • ` : ""}
                      {t.dateStart && t.dateEnd
                        ? `${t.dateStart} → ${t.dateEnd}`
                        : t.dateStart
                        ? `${t.dateStart}`
                        : "Dates TBA"}
                    </p>
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