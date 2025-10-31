import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTrip, updateTripName } from "../utils/tripStore";

const sectionsKey = (tripId) => `trip.${tripId}.sections.v1`;
const detailsKey = (tripId) => `trip.${tripId}.details.v16`;

const BUILT_IN_SECTIONS = [
  "hotels",
  "airTravel",
  "groundTransit",
  "attractions",
  "foodDining",
  "packList",
];

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(() => getTrip(id));
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(trip?.name || "");

  const [sections, setSections] = useState({
    hotels: ["Book hotel rooms", "Confirm reservations", "Check-in online"],
    airTravel: ["Book flights", "Check baggage policy", "Print boarding passes"],
    groundTransit: ["Arrange airport transfer", "Rent car", "Check public transit options"],
    attractions: ["Research must-see places", "Buy tickets in advance", "Plan daily itinerary"],
    foodDining: ["Find popular restaurants", "Make reservations", "Check dietary options"],
    packList: ["Clothes", "Travel documents", "Electronics & chargers"],
  });

  const [details, setDetails] = useState({});           // { sectionKey: [entry, entry, ...] }
  const [showForm, setShowForm] = useState({});         // { sectionKey: false | "new" | index }
  const [expandedSection, setExpandedSection] = useState({});
  const [expandedEntry, setExpandedEntry] = useState({});

  // Custom section management
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [renamingSection, setRenamingSection] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  /* --- Load / Save --- */
  useEffect(() => {
    if (!id) return;
    try {
      const rawSections = localStorage.getItem(sectionsKey(id));
      if (rawSections) setSections(JSON.parse(rawSections));
      const rawDetails = localStorage.getItem(detailsKey(id));
      if (rawDetails) {
        const parsed = JSON.parse(rawDetails);
        // Ensure arrays for any older single-object storage
        const upgraded = Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
        );
        setDetails(upgraded);
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    if (!id) return;
    try {
      localStorage.setItem(sectionsKey(id), JSON.stringify(sections));
      localStorage.setItem(detailsKey(id), JSON.stringify(details));
    } catch {}
  }, [id, sections, details]);

  useEffect(() => {
    const t = getTrip(id);
    setTrip(t);
    setNameInput(t?.name || "");
  }, [id]);

  /* --- Core Handlers --- */
  const addItem = (sectionKey, item) => {
    if (!item.trim()) return;
    setSections((prev) => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), item],
    }));
  };

  const handleAddDetails = (sectionKey, formData, index = null) => {
    setDetails((prev) => {
      const existing = prev[sectionKey] || [];
      if (index !== null) {
        const updated = [...existing];
        updated[index] = formData;
        return { ...prev, [sectionKey]: updated };
      }
      return { ...prev, [sectionKey]: [...existing, formData] };
    });
    setShowForm((prev) => ({ ...prev, [sectionKey]: false }));
    setExpandedSection((prev) => ({ ...prev, [sectionKey]: true }));
  };

  const handleDeleteDetails = (sectionKey, index) => {
    setDetails((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter((_, i) => i !== index),
    }));
  };

  const toggleSection = (key) =>
    setExpandedSection((p) => ({ ...p, [key]: !p[key] }));

  const toggleEntry = (sectionKey, i) =>
    setExpandedEntry((p) => ({
      ...p,
      [sectionKey]: p[sectionKey] === i ? null : i,
    }));

  /* --- Add / Rename / Delete Sections --- */
  const handleAddSection = (e) => {
    e.preventDefault();
    const name = newSectionName.trim();
    if (!name) return;
    const key = name
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/^./, (c) => c.toLowerCase());
    if (sections[key]) {
      alert("A section with that name already exists.");
      return;
    }
    setSections((prev) => ({ ...prev, [key]: [] }));
    setNewSectionName("");
    setAddingSection(false);
  };

  const handleRenameSection = (key) => {
    if (!renameValue.trim()) return;
    const newKey = renameValue
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/^./, (c) => c.toLowerCase());
    if (sections[newKey]) {
      alert("A section with that name already exists.");
      return;
    }
    setSections((prev) => {
      const copy = { ...prev };
      copy[newKey] = copy[key];
      delete copy[key];
      return copy;
    });
    setDetails((prev) => {
      const copy = { ...prev };
      if (copy[key]) {
        copy[newKey] = copy[key];
        delete copy[key];
      }
      return copy;
    });
    setRenamingSection(null);
    setRenameValue("");
  };

  const handleDeleteSection = (key) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setSections((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      setDetails((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  /* --- Trip Name --- */
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

  /* --- Formatting / Preview --- */
  const formatLabel = (str) =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

  const formatDate = (str) => {
    if (!str) return "";
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateTime = (date, time) => {
    if (!date && !time) return "";
    if (!date) return time;
    if (!time) return formatDate(date);
    try {
      const combined = new Date(`${date}T${time}`);
      return combined.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return `${formatDate(date)} ${time}`;
    }
  };

  const getSectionPreview = (entry, key) => {
    const d = entry;
    switch (key) {
      case "hotels":
        return d.hotelName
          ? `${d.hotelName}${d.location ? `, ${d.location}` : ""}${
              d.checkIn || d.checkOut
                ? ` • ${formatDateTime(d.checkIn, d.checkInTime)}${
                    d.checkOut || d.checkOutTime
                      ? " – " + formatDateTime(d.checkOut, d.checkOutTime)
                      : ""
                  }`
                : ""
            }`
          : null;
      case "airTravel":
        return d.airline
          ? `${d.airline} ${d.flightNumber || ""}${
              d.departureDate || d.arrivalDate
                ? ` • ${formatDateTime(d.departureDate, d.departureTime)}${
                    d.arrivalDate || d.arrivalTime
                      ? " → " + formatDateTime(d.arrivalDate, d.arrivalTime)
                      : ""
                  }`
                : ""
            }`
          : null;
      case "groundTransit":
        return d.provider
          ? `${d.provider}${d.type ? ` (${d.type})` : ""}${
              d.pickupDate || d.pickupTime
                ? ` • ${formatDateTime(d.pickupDate, d.pickupTime)}${
                    d.dropoffDate || d.dropoffTime
                      ? " → " + formatDateTime(d.dropoffDate, d.dropoffTime)
                      : ""
                  }`
                : ""
            }`
          : null;
      default: {
        const filtered = Object.entries(d)
          .filter(([k, v]) => k !== "notes" && v)
          .map(([, v]) => v);
        return filtered.length ? filtered.join(" • ") : null;
      }
    }
  };

  const renderFullDetails = (entry) => (
    <div className="details-card">
      {Object.entries(entry).map(([label, value]) =>
        value && label !== "notes" ? (
          <div key={label} className="details-row">
            <span className="details-label">{formatLabel(label)}:</span>
            <span className="details-value">{value}</span>
          </div>
        ) : null
      )}
      {entry.notes && (
        <div className="details-row notes-row">
          <span className="details-label">Notes:</span>
          <span className="details-value">{entry.notes}</span>
        </div>
      )}
    </div>
  );

  if (!trip)
    return (
      <main className="detail-main">
        <h1>Trip not found</h1>
        <Link to="/trips">Back to Trips</Link>
      </main>
    );

  return (
    <main className="detail-main">
      <header className="trip-header">
        {editing ? (
          <div>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
            />
            <button onClick={saveName}>Save</button>
            <button onClick={cancelEdit}>Cancel</button>
          </div>
        ) : (
          <div>
            <h1>{trip.name}</h1>
            <button onClick={startEdit}>Rename</button>
          </div>
        )}
        <p>
          {trip.location ? `${trip.location} • ` : ""}
          {trip.dateStart && trip.dateEnd
            ? `${trip.dateStart} → ${trip.dateEnd}`
            : trip.dateStart
            ? trip.dateStart
            : "Dates TBA"}
        </p>
      </header>

      <section className="checklist-section">
        <h2>Travel Planning Checklist</h2>

        {Object.entries(sections).map(([key, items]) => {
          const isCustom = !BUILT_IN_SECTIONS.includes(key);
          return (
            <div key={key} className="checklist-category">
              <div className="category-header">
                {renamingSection === key ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRenameSection(key);
                    }}
                    className="rename-form"
                  >
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="cta-btn">Save</button>
                    <button
                      type="button"
                      onClick={() => setRenamingSection(null)}
                      className="nav-item"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h3>{formatLabel(key)}</h3>
                    <div className="category-actions">
                      <button onClick={() => toggleSection(key)}>
                        {expandedSection[key] ? "Hide" : "Show"} Details
                      </button>
                      {isCustom && (
                        <>
                          <button
                            onClick={() => {
                              setRenamingSection(key);
                              setRenameValue(formatLabel(key));
                            }}
                            className="nav-item"
                          >
                            ✏️ Rename
                          </button>
                          <button
                            onClick={() => handleDeleteSection(key)}
                            className="nav-item"
                          >
                            🗑 Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {expandedSection[key] && (
                <div className="details-display">
                  <h4>Details</h4>
                  {details[key]?.length > 0 ? (
                    details[key].map((entry, i) => (
                      <div key={i} className="details-entry">
                        <div className="details-preview">
                          {getSectionPreview(entry, key)}
                        </div>
                        <div className="form-actions">
                          <button
                            className="nav-item"
                            onClick={() => toggleEntry(key, i)}
                          >
                            {expandedEntry[key] === i ? "Hide Details" : "View Details"}
                          </button>
                          <button
                            className="nav-item"
                            onClick={() => setShowForm((p) => ({ ...p, [key]: i }))}
                          >
                            Edit
                          </button>
                          <button
                            className="nav-item"
                            onClick={() => handleDeleteDetails(key, i)}
                          >
                            Delete
                          </button>
                        </div>
                        {expandedEntry[key] === i && renderFullDetails(entry)}
                      </div>
                    ))
                  ) : (
                    <p className="details-preview">No details yet.</p>
                  )}
                  <button
                    onClick={() => setShowForm((p) => ({ ...p, [key]: "new" }))}
                    className="add-btn"
                  >
                    + Add Another
                  </button>
                </div>
              )}

              {showForm[key] !== false && (
                <DetailsForm
                  sectionKey={key}
                  existing={
                    showForm[key] === "new"
                      ? null
                      : details[key]?.[showForm[key]] || null
                  }
                  onSave={(section, formData) =>
                    handleAddDetails(
                      section,
                      formData,
                      showForm[key] === "new" ? null : showForm[key]
                    )
                  }
                  onCancel={() =>
                    setShowForm((prev) => ({ ...prev, [key]: false }))
                  }
                />
              )}

              <ul className="checklist-items">
                {items.map((item, i) => (
                  <li key={i}>
                    <input type="checkbox" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <AddItemForm
                onAdd={(newItem) => addItem(key, newItem)}
                placeholder={`Add new ${formatLabel(key)} item`}
              />
            </div>
          );
        })}

        {/* Add new custom section */}
        <div className="add-section-area">
          {addingSection ? (
            <form onSubmit={handleAddSection} className="add-section-form">
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Enter new section name"
                autoFocus
              />
              <button type="submit" className="cta-btn">Add</button>
              <button
                type="button"
                onClick={() => setAddingSection(false)}
                className="nav-item"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button onClick={() => setAddingSection(true)} className="add-btn">
              + Add Section
            </button>
          )}
        </div>
      </section>

      <footer>
        <Link to="/trips" className="back-to-trips">← Back to all trips</Link>
      </footer>
    </main>
  );
}

/* === DetailsForm === */
function DetailsForm({ sectionKey, existing, onSave, onCancel }) {
  // Self-contained label helper for this component
  const formatLabel = (str) =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

  const getInitialState = () => {
    switch (sectionKey) {
      case "hotels":
        return {
          hotelName: "",
          location: "",
          checkIn: "",
          checkInTime: "",
          checkOut: "",
          checkOutTime: "",
          notes: "",
        };
      case "airTravel":
        return {
          airline: "",
          flightNumber: "",
          departureDate: "",
          departureTime: "",
          arrivalDate: "",
          arrivalTime: "",
          notes: "",
        };
      case "groundTransit":
        return {
          provider: "",
          type: "",
          pickupLocation: "",
          dropoffLocation: "",
          pickupDate: "",
          pickupTime: "",
          dropoffDate: "",
          dropoffTime: "",
          notes: "",
        };
      case "attractions":
        return { attractionName: "", location: "", date: "", notes: "" };
      case "foodDining":
        return { restaurantName: "", location: "", reservationTime: "", notes: "" };
      case "packList":
        return { notes: "" };
      default:
        // Custom sections default to notes-only
        return { notes: "" };
    }
  };

  const [formData, setFormData] = useState(existing || getInitialState());
  const [error, setError] = useState("");

  const handleChange = (f, v) => setFormData((p) => ({ ...p, [f]: v }));

  const toDateTime = (d, t) => (d ? new Date(`${d}T${t || "00:00"}`) : null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate date/time ordering for known pairs
    const pairs = [
      ["checkIn", "checkInTime", "checkOut", "checkOutTime"],
      ["departureDate", "departureTime", "arrivalDate", "arrivalTime"],
      ["pickupDate", "pickupTime", "dropoffDate", "dropoffTime"],
    ];
    for (const [sd, st, ed, et] of pairs) {
      const hasAny =
        Object.prototype.hasOwnProperty.call(formData, sd) ||
        Object.prototype.hasOwnProperty.call(formData, ed);
      if (!hasAny) continue;
      const start = toDateTime(formData[sd], formData[st]);
      const end = toDateTime(formData[ed], formData[et]);
      if (start && end && start > end) {
        setError(`${formatLabel(sd)} must be before ${formatLabel(ed)}.`);
        return;
      }
    }
    setError("");
    onSave(sectionKey, formData);
  };

  // Group known date/time pairs for compact layout
  const pairedFields = {
    hotels: [
      ["checkIn", "checkInTime"],
      ["checkOut", "checkOutTime"],
    ],
    airTravel: [
      ["departureDate", "departureTime"],
      ["arrivalDate", "arrivalTime"],
    ],
    groundTransit: [
      ["pickupDate", "pickupTime"],
      ["dropoffDate", "dropoffTime"],
    ],
  };

  const isPairedTimeField = (field) =>
    Object.values(pairedFields)
      .flat()
      .some(([d, t]) => t === field);

  return (
    <form onSubmit={handleSubmit} className="details-form">
      <h4>{existing ? "Edit Details" : "Add Details"}</h4>

      {Object.keys(formData).map((f) => {
        if (f === "notes") return null; // render at the end
        if (isPairedTimeField(f)) return null; // will render with its date partner

        // If this field is a date partner in a known pair, render date+time side-by-side
        for (const group of pairedFields[sectionKey] || []) {
          if (group[0] === f) {
            const [dateKey, timeKey] = group;
            return (
              <div key={f} className="form-row paired-inputs">
                <label>{formatLabel(f.replace("Date", "").replace("check", "Check "))}:</label>
                <div className="pair-group">
                  <input
                    type="date"
                    value={formData[dateKey]}
                    onChange={(e) => handleChange(dateKey, e.target.value)}
                  />
                  <input
                    type="time"
                    value={formData[timeKey]}
                    onChange={(e) => handleChange(timeKey, e.target.value)}
                  />
                </div>
              </div>
            );
          }
        }

        // Otherwise, render a standard input
        return (
          <div key={f} className="form-row">
            <label>{formatLabel(f)}:</label>
            <input
              type={
                f.toLowerCase().includes("date")
                  ? "date"
                  : f.toLowerCase().includes("time")
                  ? "time"
                  : "text"
              }
              value={formData[f]}
              onChange={(e) => handleChange(f, e.target.value)}
            />
          </div>
        );
      })}

      {/* Notes textarea */}
      <div className="form-row">
        <label>Notes:</label>
        <textarea
          value={formData.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={3}
          placeholder="Add any additional notes or reminders…"
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="cta-btn">Save</button>
        <button type="button" onClick={onCancel} className="nav-item">Cancel</button>
      </div>
    </form>
  );
}

/* === AddItem Form === */
function AddItemForm({ onAdd, placeholder }) {
  const [value, setValue] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
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
