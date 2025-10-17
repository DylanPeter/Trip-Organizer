import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTrips, createTrip, deleteTrip, renameTrip } from "../utils/tripstore";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  // Load on mount
  useEffect(() => {
    setTrips(getTrips());
  }, []);

  // Sync if localStorage changes in another tab
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
    <main className="mx-auto" style={{ maxWidth: 1000, padding: "2.5rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 className="text-2xl" style={{ margin: 0 }}>Your Trips</h1>
        <button onClick={handleCreate} className="cta-btn">+ Create Trip</button>
      </div>

      {trips.length === 0 ? (
        <div className="feature-card">
          <p style={{ marginBottom: "0.75rem" }}>You don’t have any trips yet.</p>
          <button onClick={handleCreate} className="cta-btn">Create your first trip</button>
        </div>
      ) : (
        <ul style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {trips
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((t) => (
              <li key={t.id} className="feature-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                  <div>
                    <Link to={`/trips/${t.id}`} className="text-slate-900" style={{ fontWeight: 600 }}>
                      {t.name}
                    </Link>
                    <p className="text-xs" style={{ opacity: 0.8 }}>
                      Created {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button onClick={() => handleRename(t.id, t.name)} className="nav-item" style={{ padding: "4px 8px" }}>
                      Rename
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="nav-item" style={{ padding: "4px 8px", color: "crimson" }}>
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <Link to={`/trips/${t.id}`} className="text-slate-700">Open checklist →</Link>
                </div>
              </li>
            ))}
        </ul>
      )}
    </main>
  );
}