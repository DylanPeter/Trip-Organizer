import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTrip } from "../utils/tripstore";

// Key used to persist the checklist per trip
const sectionsKey = (tripId) => `trip.${tripId}.sections.v1`;

export default function TripDetail() {
  const { id } = useParams();
  const trip = getTrip(id);

  //  1) Checklist state 
  const [sections, setSections] = useState({
    hotels: ["Book hotel rooms", "Confirm reservations", "Check-in online"],
    airTravel: ["Book flights", "Check baggage policy", "Print boarding passes"],
    groundTransit: ["Arrange airport transfer", "Rent car", "Check public transit options"],
    attractions: ["Research must-see places", "Buy tickets in advance", "Plan daily itinerary"],
    foodDining: ["Find popular restaurants", "Make reservations", "Check dietary options"],
    packList: ["Clothes", "Travel documents", "Electronics & chargers"],
  });

  // ---- 2) Load/save checklist per trip ----
  useEffect(() => {
    if (!id) return;
    try {
      const raw = localStorage.getItem(sectionsKey(id));
      if (raw) setSections(JSON.parse(raw));
    } catch {}
  }, [id]);

  useEffect(() => {
    if (!id) return;
    try {
      localStorage.setItem(sectionsKey(id), JSON.stringify(sections));
    } catch {}
  }, [id, sections]);

  //  3) Add item
  const addItem = (sectionKey, item) => {
    if (!item.trim()) return;
    setSections((prev) => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], item],
    }));
  };

  if (!trip) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-xl font-semibold mb-2">Trip not found</h1>
        <Link to="/trips" className="text-slate-700 underline">Back to Trips</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{trip.name}</h1>
        <p className="text-sm text-slate-500">
          Created {new Date(trip.createdAt).toLocaleString()}
        </p>
      </header>

      <h2 className="text-xl font-semibold mb-4">Travel Planning Checklist</h2>

      {Object.entries(sections).map(([key, items]) => (
        <div key={key} className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold capitalize mb-2">
            {key.replace(/([A-Z])/g, " $1")}
          </h3>

          <ul className="space-y-1 mb-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <input type="checkbox" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <AddItemForm
            onAdd={(newItem) => addItem(key, newItem)}
            placeholder={`Add new ${key.replace(/([A-Z])/g, " $1").toLowerCase()} item`}
          />
        </div>
      ))}

      <p className="mt-6">
        <Link to="/trips" className="text-slate-700 underline">All trips</Link>
      </p>
    </main>
  );
}

//  Inline Add Item form (from your snippet) 
function AddItemForm({ onAdd, placeholder }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
      >
        Add
      </button>
    </form>
  );
}