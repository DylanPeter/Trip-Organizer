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
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Trips</h1>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          + Create Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700 mb-3">You don’t have any trips yet.</p>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            Create your first trip
          </button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {trips
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((t) => (
              <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`/trips/${t.id}`}
                      className="text-slate-900 font-medium hover:underline"
                    >
                      {t.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Created {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRename(t.id, t.name)}
                      className="rounded px-2 py-1 text-xs hover:bg-slate-100"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    to={`/trips/${t.id}`}
                    className="text-sm underline text-slate-700"
                  >
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