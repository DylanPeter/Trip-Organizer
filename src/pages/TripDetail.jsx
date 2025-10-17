import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTrip } from "../utils/tripstore";
import "../index.css";

const sectionsKey = (tripId) => `trip.${tripId}.sections.v1`;

export default function TripDetail() {
  const { id } = useParams();
  const trip = getTrip(id);

  const [sections, setSections] = useState({
    hotels: ["Book hotel rooms", "Confirm reservations", "Check-in online"],
    airTravel: ["Book flights", "Check baggage policy", "Print boarding passes"],
    groundTransit: ["Arrange airport transfer", "Rent car", "Check public transit options"],
    attractions: ["Research must-see places", "Buy tickets in advance", "Plan daily itinerary"],
    foodDining: ["Find popular restaurants", "Make reservations", "Check dietary options"],
    packList: ["Clothes", "Travel documents", "Electronics & chargers"],
  });

  // Load saved checklist
  useEffect(() => {
    if (!id) return;
    try {
      const raw = localStorage.getItem(sectionsKey(id));
      if (raw) setSections(JSON.parse(raw));
    } catch {}
  }, [id]);

  // Save checklist
  useEffect(() => {
    if (!id) return;
    try {
      localStorage.setItem(sectionsKey(id), JSON.stringify(sections));
    } catch {}
  }, [id, sections]);

  const addItem = (sectionKey, item) => {
    if (!item.trim()) return;
    setSections((prev) => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], item],
    }));
  };

  if (!trip) {
    return (
      <main className="detail-main">
        <h1>Trip not found</h1>
        <Link className="back-link" to="/trips">← Back to Trips</Link>
      </main>
    );
  }

  return (
    <main className="detail-main">
      <header className="trip-header">
        <h1>{trip.name}</h1>
        <p className="creation-details">
          Created {new Date(trip.createdAt).toLocaleString()}
        </p>
      </header>

      <section className="checklist-section">
        <h2>Travel Planning Checklist</h2>

        {Object.entries(sections).map(([key, items]) => (
          <div key={key} className="checklist-category">
            <h3>{key.replace(/([A-Z])/g, " $1")}</h3>

            <ul className="checklist-items">
              {items.map((item, i) => (
                <li key={i} className="checklist-item">
                  <label>
                    <input type="checkbox" className="check-item-box" />
                    <span>{item}</span>
                  </label>
                </li>
              ))}
            </ul>

            <AddItemForm
              onAdd={(newItem) => addItem(key, newItem)}
              placeholder={`Add new ${key.replace(/([A-Z])/g, " $1").toLowerCase()} item`}
            />
          </div>
        ))}

        <p className="back-to-trips">
          <Link className="back-link" to="/trips">← All trips</Link>
        </p>
      </section>
    </main>
  );
}

function AddItemForm({ onAdd, placeholder }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="add-item-form">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="add-input"
      />
      <button type="submit" className="add-btn">Add</button>
    </form>
  );
}
