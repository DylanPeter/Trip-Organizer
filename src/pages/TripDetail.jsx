import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTrip, updateTripName } from "../utils/tripstore";

const sectionsKey = (tripId) => `trip.${tripId}.sections.v1`;

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(() => getTrip(id));

  // rename UI state
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(trip?.name || "");

  // checklist data
  const [sections, setSections] = useState({
    hotels: ["Book hotel rooms", "Confirm reservations", "Check-in online"],
    airTravel: ["Book flights", "Check baggage policy", "Print boarding passes"],
    groundTransit: ["Arrange airport transfer", "Rent car", "Check public transit options"],
    attractions: ["Research must-see places", "Buy tickets in advance", "Plan daily itinerary"],
    foodDining: ["Find popular restaurants", "Make reservations", "Check dietary options"],
    packList: ["Clothes", "Travel documents", "Electronics & chargers"],
  });

  // load checklist from localStorage
  useEffect(() => {
    if (!id) return;
    try {
      const raw = localStorage.getItem(sectionsKey(id));
      if (raw) setSections(JSON.parse(raw));
    } catch {}
  }, [id]);

  // save checklist changes
  useEffect(() => {
    if (!id) return;
    try {
      localStorage.setItem(sectionsKey(id), JSON.stringify(sections));
    } catch {}
  }, [id, sections]);

  // sync trip when ID changes
  useEffect(() => {
    const t = getTrip(id);
    setTrip(t);
    setNameInput(t?.name || "");
  }, [id]);

  const addItem = (sectionKey, item) => {
    if (!item.trim()) return;
    setSections((prev) => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], item],
    }));
  };

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    setNameInput(trip.name);
    setEditing(false);
  };
  const saveName = () => {
    const next = nameInput.trim() || "Untitled Trip";
    updateTripName(id, next);
    const t = getTrip(id);
    setTrip(t);
    setEditing(false);
    document.title = `${t.name} • UsTinerary`;
  };

  if (!trip) {
    return (
      <main className="detail-main">
        <h1>Trip not found</h1>
        <Link to="/trips" className="back-link">
          Back to Trips
        </Link>
      </main>
    );
  }

  return (
    <main className="detail-main">
      {/* Trip header with editable title */}
      <header className="trip-header">
        {editing ? (
          <div>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              placeholder="Trip name"
            />
            <button onClick={saveName} className="cta-btn">
              Save
            </button>
            <button onClick={cancelEdit} className="nav-item">
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <h1>{trip.name}</h1>
            <button onClick={startEdit} className="nav-item">
              Rename
            </button>
          </div>
        )}
          <p className="trip-date">
            {trip.location ? `${trip.location} • ` : ""}
            {trip.dateStart && trip.dateEnd
              ? `${trip.dateStart} → ${trip.dateEnd}`
              : trip.dateStart
              ? `${trip.dateStart}`
              : "Dates TBA"}
          </p>
      </header>

      {/* Checklist */}
      <section className="checklist-section">
        <h2>Travel Planning Checklist</h2>

        {Object.entries(sections).map(([key, items]) => (
          <div key={key} className="checklist-category">
            <h3>
              {key.replace(/([A-Z])/g, " $1")}
            </h3>

            <ul className="checklist-items">
              {items.map((item, i) => (
                <li key={i}>
                  <input type="checkbox" className="check-item-box"/>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <AddItemForm
              onAdd={(newItem) => addItem(key, newItem)}
              placeholder={`Add new ${key
                .replace(/([A-Z])/g, " $1")
                .toLowerCase()} item`}
            />
          </div>
        ))}
      </section>

      <footer>
        <Link to="/trips" className="back-to-trips">
          ← Back to all trips
        </Link>
      </footer>
    </main>
  );
}

// Form for adding new checklist items
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
      <button type="submit" className="add-btn">
        Add
      </button>
    </form>
  );
}