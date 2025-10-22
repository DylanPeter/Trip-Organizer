import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTrip } from "../utils/tripStore";

export default function TripCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState("My Next Adventure");
  const [location, setLocation] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateStart && dateEnd && new Date(dateEnd) < new Date(dateStart)) {
      alert("End date can’t be before start date.");
      return;
    }
    const id = createTrip({
      name: name.trim() || "Untitled Trip",
      location: location.trim(),
      dateStart,
      dateEnd,
    });
    navigate(`/trips/${id}`);
  };

  return (
    <main className="page-container">
      <h1 className="page-title">Create a new trip</h1>

      <form onSubmit={handleSubmit} className="add-item-form" style={{ flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <label>
            <div>Trip name</div>
            <input
              className="add-item-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paris with friends"
            />
          </label>

          <label>
            <div>Location</div>
            <input
              className="add-item-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label>
              <div>Start date</div>
              <input
                type="date"
                className="add-item-input"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </label>

            <label>
              <div>End date</div>
              <input
                type="date"
                className="add-item-input"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                min={dateStart || undefined}
              />
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit" className="cta-btn">Create trip</button>
          <button type="button" className="nav-item" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </main>
  );
}