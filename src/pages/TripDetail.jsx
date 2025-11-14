import React, { useEffect, useState } from "react";
import SectionComments from "../components/SectionComments";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, Link } from "react-router-dom";
import { getTrip, updateTripName, setTrip } from "../utils/tripstore";

const sectionsKey = (tripId) => `trip.${tripId}.sections.v1`;
const detailsKey = (tripId) => `trip.${tripId}.details.v16`;
const budgetKey = (tripId) => `trip.${tripId}.budget.v1`;

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
  const { user } = useAuth0();

  const [trip, setTripState] = useState(() => getTrip(id));
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(trip?.name || "");

  // date editing state
  const [editingDates, setEditingDates] = useState(false);
  const [startInput, setStartInput] = useState(trip?.dateStart || "");
  const [endInput, setEndInput] = useState(trip?.dateEnd || "");

  const [sections, setSections] = useState({
    hotels: ["Book hotel rooms", "Confirm reservations", "Check-in online"],
    airTravel: ["Book flights", "Check baggage policy", "Print boarding passes"],
    groundTransit: [
      "Arrange airport transfer",
      "Rent car",
      "Check public transit options",
    ],
    attractions: [
      "Research must-see places",
      "Buy tickets in advance",
      "Plan daily itinerary",
    ],
    foodDining: ["Find popular restaurants", "Make reservations", "Check dietary options"],
    packList: ["Clothes", "Travel documents", "Electronics & chargers"],
  });

  const [details, setDetails] = useState({});
  const [showForm, setShowForm] = useState({});
  const [expandedSection, setExpandedSection] = useState({});
  const [expandedEntry, setExpandedEntry] = useState({});

  // Section management
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [renamingSection, setRenamingSection] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Budget management
  const [totalBudget, setTotalBudget] = useState(0);
  const [sectionBudgets, setSectionBudgets] = useState({});

  /* --- Load / Save --- */
  useEffect(() => {
    if (!id) return;
    try {
      const rawSections = localStorage.getItem(sectionsKey(id));
      if (rawSections) setSections(JSON.parse(rawSections));

      const rawDetails = localStorage.getItem(detailsKey(id));
      if (rawDetails) {
        const parsed = JSON.parse(rawDetails);
        const upgraded = Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
        );
        setDetails(upgraded);
      }

      const rawBudget = localStorage.getItem(budgetKey(id));
      if (rawBudget) {
        const parsed = JSON.parse(rawBudget);
        setTotalBudget(parsed.total || 0);
        setSectionBudgets(parsed.sections || {});
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    if (!id) return;
    try {
      localStorage.setItem(sectionsKey(id), JSON.stringify(sections));
      localStorage.setItem(detailsKey(id), JSON.stringify(details));
      localStorage.setItem(
        budgetKey(id),
        JSON.stringify({ total: totalBudget, sections: sectionBudgets })
      );
    } catch {}
  }, [id, sections, details, totalBudget, sectionBudgets]);

  useEffect(() => {
    const t = getTrip(id);
    setTripState(t);
    setNameInput(t?.name || "");
    // keep date inputs in sync
    setStartInput(t?.dateStart || "");
    setEndInput(t?.dateEnd || "");
  }, [id]);

  /* --- Section Handlers --- */
  const addItem = (sectionKey, item) => {
    if (!item.trim()) return;
    setSections((prev) => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), item],
    }));
  };

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
    setSectionBudgets((prev) => {
      const copy = { ...prev };
      if (copy[key] !== undefined) {
        copy[newKey] = copy[key];
        delete copy[key];
      }
      return copy;
    });
    setRenamingSection(null);
    setRenameValue("");
  };

  const handleDeleteSection = (key) => {
    if (window.confirm("Are you sure?")) {
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
      setSectionBudgets((prev) => {
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
    setTripState(t);
    setEditing(false);
    document.title = `${t.name} • UsTinerary`;
  };

  /* --- Trip Dates --- */
  const startEditDates = () => {
    setStartInput(trip?.dateStart || "");
    setEndInput(trip?.dateEnd || "");
    setEditingDates(true);
  };

  const cancelEditDates = () => {
    setEditingDates(false);
  };

  const saveTripDates = () => {
    if (!trip) return;
    const updated = {
      ...trip,
      dateStart: startInput || "",
      dateEnd: endInput || "",
    };

    try {
      setTrip(updated);
    } catch (err) {
      console.error("Failed to update trip dates:", err);
    }

    setTripState(updated);
    setEditingDates(false);
  };

  /* --- Helpers --- */
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

  const totalAllocated = Object.values(sectionBudgets).reduce(
    (a, b) => a + (b || 0),
    0
  );
  const remainingBudget = totalBudget - totalAllocated;

  const toggleSection = (key) =>
    setExpandedSection((p) => ({ ...p, [key]: !p[key] }));

  const toggleEntry = (sectionKey, i) =>
    setExpandedEntry((p) => ({
      ...p,
      [sectionKey]: p[sectionKey] === i ? null : i,
    }));

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

          {editingDates ? (
            <span className="edit-dates-container">
              <input
                type="date"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
              />
              <span> → </span>
              <input
                type="date"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
              />
              <button
                type="button"
                onClick={saveTripDates}
                className="nav-item"
                style={{ marginLeft: "0.5rem" }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelEditDates}
                className="nav-item"
              >
                Cancel
              </button>
            </span>
          ) : (
            <>
              {trip.dateStart && trip.dateEnd
                ? `${formatDate(trip.dateStart)} → ${formatDate(trip.dateEnd)}`
                : trip.dateStart
                ? formatDate(trip.dateStart)
                : "Dates TBA"}
              <button
                type="button"
                className="nav-item"
                onClick={startEditDates}
                style={{ marginLeft: "0.75rem" }}
              >
                Edit Dates
              </button>
            </>
          )}
        </p>
      </header>

      {/* Checklist always visible */}
      <section className="checklist-section">
        <h2>Travel Planning Checklist</h2>

        {Object.entries(sections).map(([key, items]) => {
          const isCustom = !BUILT_IN_SECTIONS.includes(key);
          return (
            <div key={key} className="checklist-category">
              <div className="category-header" onClick={() => toggleSection(key)}>
                <h3>{formatLabel(key)}</h3>
                <div className="category-actions">
                  <span className="collapse-icon">
                    {expandedSection[key] ? "▲" : "▼"}
                  </span>
                  {isCustom && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingSection(key);
                          setRenameValue(formatLabel(key));
                          const next = window.prompt(
                            "Rename section:",
                            formatLabel(key)
                          );
                          if (next && next.trim()) {
                            setRenameValue(next);
                            handleRenameSection(key);
                          }
                        }}
                        className="nav-item"
                      >
                        ✏️ Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(key);
                        }}
                        className="nav-item"
                      >
                        🗑 Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div
                className={`section-content ${
                  expandedSection[key] ? "expanded" : "collapsed"
                }`}
              >
                {expandedSection[key] && (
                  <>
                    {/* === EXPLORE BUTTON === */}
                    {["hotels", "attractions", "foodDining"].includes(key) && (
                      <div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
                        <Link
                          to={`/explore/${id}?category=${key}`}
                          className="cta-btn"
                          style={{ textDecoration: "none" }}
                        >
                          {key === "hotels" && "Explore Hotels"}
                          {key === "attractions" && "Explore Attractions"}
                          {key === "foodDining" && "Explore Restaurants"}
                        </Link>
                      </div>
                    )}

                    <div className="details-display">
                      <h4>Details</h4>
                      {details[key]?.length > 0 ? (
                        details[key].map((entry, i) => (
                          <div key={i} className="details-entry">
                            <div className="details-preview">
                              {Object.entries(entry)
                                .filter(
                                  ([k, v]) =>
                                    k !== "notes" &&
                                    k !== "pollingEnabled" &&
                                    v
                                )
                                .map(([field, value]) => {
                                  // Use nicer formatting for date/time pairs if present
                                  if (
                                    field === "checkIn" &&
                                    entry.checkIn &&
                                    entry.checkInTime
                                  ) {
                                    return formatDateTime(
                                      entry.checkIn,
                                      entry.checkInTime
                                    );
                                  }
                                  if (
                                    field === "checkOut" &&
                                    entry.checkOut &&
                                    entry.checkOutTime
                                  ) {
                                    return formatDateTime(
                                      entry.checkOut,
                                      entry.checkOutTime
                                    );
                                  }
                                  if (
                                    field === "departureDate" &&
                                    entry.departureDate &&
                                    entry.departureTime
                                  ) {
                                    return formatDateTime(
                                      entry.departureDate,
                                      entry.departureTime
                                    );
                                  }
                                  if (
                                    field === "arrivalDate" &&
                                    entry.arrivalDate &&
                                    entry.arrivalTime
                                  ) {
                                    return formatDateTime(
                                      entry.arrivalDate,
                                      entry.arrivalTime
                                    );
                                  }
                                  if (
                                    field === "pickupDate" &&
                                    entry.pickupDate &&
                                    entry.pickupTime
                                  ) {
                                    return formatDateTime(
                                      entry.pickupDate,
                                      entry.pickupTime
                                    );
                                  }
                                  if (
                                    field === "dropoffDate" &&
                                    entry.dropoffDate &&
                                    entry.dropoffTime
                                  ) {
                                    return formatDateTime(
                                      entry.dropoffDate,
                                      entry.dropoffTime
                                    );
                                  }
                                  return value;
                                })
                                .join(" • ")}
                            </div>
                            <div className="form-actions">
                              <button
                                className="nav-item"
                                onClick={() => toggleEntry(key, i)}
                              >
                                {expandedEntry[key] === i
                                  ? "Hide Details"
                                  : "View Details"}
                              </button>
                              <button
                                className="nav-item"
                                onClick={() =>
                                  setShowForm((p) => ({ ...p, [key]: i }))
                                }
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
                            {expandedEntry[key] === i && (
                              <>
                                {renderFullDetails(entry, formatLabel)}
                                {entry.pollingEnabled && (
                                  <PollBox
                                    tripId={id}
                                    sectionKey={key}
                                    entryIndex={i}
                                    user={user}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="details-preview">No details yet.</p>
                      )}
                      <button
                        onClick={() =>
                          setShowForm((p) => ({ ...p, [key]: "new" }))
                        }
                        className="add-btn"
                      >
                        + Add Another
                      </button>
                    </div>

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

                    {/* comments */}
                    <SectionComments tripId={id} sectionKey={key} user={user} />
                  </>
                )}
              </div>
            </div>
          );
        })}

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
              <button type="submit" className="cta-btn">
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddingSection(false)}
                className="nav-item"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAddingSection(true)}
              className="add-btn"
            >
              + Add Section
            </button>
          )}
        </div>
      </section>

      {/* Floating budget widget */}
      <BudgetWidget
        totalBudget={totalBudget}
        setTotalBudget={setTotalBudget}
        sectionBudgets={sectionBudgets}
        setSectionBudgets={setSectionBudgets}
        sections={sections}
        totalAllocated={totalAllocated}
        remainingBudget={remainingBudget}
        formatLabel={formatLabel}
      />

      <footer>
        <Link to="/trips" className="back-to-trips">
          ← Back to all trips
        </Link>
      </footer>
    </main>
  );
}

function renderFullDetails(entry, formatLabel) {
  return (
    <div className="details-card">
      {Object.entries(entry).map(([label, value]) =>
        value && label !== "notes" && label !== "pollingEnabled" ? (
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
}

/* === (Optional legacy) BudgetSummary === */
/* Kept here in case you still want a full-page budget view later.
   Currently unused since we moved to the floating widget. */
function BudgetSummary({
  totalBudget,
  setTotalBudget,
  sectionBudgets,
  setSectionBudgets,
  sections,
  totalAllocated,
  remainingBudget,
  formatLabel,
}) {
  return (
    <section className="budget-summary">
      <h2>Trip Budget</h2>
      <div className="budget-total">
        <label>Total Budget:</label>
        <input
          type="number"
          value={totalBudget}
          onChange={(e) => setTotalBudget(Number(e.target.value) || 0)}
          placeholder="Enter total budget"
        />
      </div>

      <table className="budget-table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Budget</th>
            <th>% of Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(sections).map((key) => (
            <tr key={key}>
              <td>{formatLabel(key)}</td>
              <td>
                <input
                  type="number"
                  value={sectionBudgets[key] || ""}
                  onChange={(e) =>
                    setSectionBudgets((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
                <div className="budget-progress">
                  <div
                    className="budget-progress-fill"
                    style={{
                      width: totalBudget
                        ? `${Math.min(
                            ((sectionBudgets[key] || 0) / totalBudget) * 100,
                            100
                          )}%`
                        : "0%",
                    }}
                  />
                </div>
              </td>
              <td>
                {totalBudget
                  ? (
                      ((sectionBudgets[key] || 0) / totalBudget) *
                      100
                    ).toFixed(1) + "%"
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        <strong>Total allocated:</strong> ${totalAllocated} / $
        {totalBudget || 0}
      </p>
      <p>
        <strong>Remaining:</strong> ${remainingBudget}
      </p>
    </section>
  );
}

/* === DetailsForm === */
function DetailsForm({ sectionKey, existing, onSave, onCancel }) {
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
          pollingEnabled: false,
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
          pollingEnabled: false,
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
          pollingEnabled: false,
        };
      case "attractions":
        return {
          attractionName: "",
          location: "",
          date: "",
          notes: "",
          pollingEnabled: false,
        };
      case "foodDining":
        return {
          restaurantName: "",
          location: "",
          reservationTime: "",
          notes: "",
          pollingEnabled: false,
        };
      case "packList":
        return { notes: "", pollingEnabled: false };
      default:
        return { notes: "", pollingEnabled: false };
    }
  };

  const [formData, setFormData] = useState(existing || getInitialState());
  const [error, setError] = useState("");

  const handleChange = (f, v) => setFormData((p) => ({ ...p, [f]: v }));

  const toDateTime = (d, t) => (d ? new Date(`${d}T${t || "00:00"}`) : null);

  const handleSubmit = (e) => {
    e.preventDefault();
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
        if (f === "notes" || f === "pollingEnabled") return null;
        if (isPairedTimeField(f)) return null;

        for (const group of pairedFields[sectionKey] || []) {
          if (group[0] === f) {
            const [dateKey, timeKey] = group;
            return (
              <div key={f} className="form-row paired-inputs">
                <label>
                  {formatLabel(
                    f.replace("Date", "").replace("check", "Check ")
                  )}
                  :
                </label>
                <div className="pair-group">
                  <input
                    type="date"
                    value={formData[dateKey]}
                    onChange={(e) => handleChange(dateKey, e.target.value)}
                  />
                  <TimePicker
                    value={formData[timeKey]}
                    onChange={(val) => handleChange(timeKey, val)}
                  />
                </div>
              </div>
            );
          }
        }

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

      <div className="form-row toggle-row">
        <label>
          <input
            type="checkbox"
            checked={formData.pollingEnabled || false}
            onChange={(e) => handleChange("pollingEnabled", e.target.checked)}
          />{" "}
          Enable Polling for this Item
        </label>
      </div>

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
        <button type="submit" className="cta-btn">
          Save
        </button>
        <button type="button" onClick={onCancel} className="nav-item">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* === AddItemForm === */
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
      <button type="submit" className="add-btn">
        Add
      </button>
    </form>
  );
}

/* === TimePicker === */
function TimePicker({ value, onChange }) {
  const parseTime = (t) => {
    if (!t) return { h: "", m: "", period: "AM" };
    const [hRaw, mRaw] = t.split(":");
    let h = parseInt(hRaw, 10);
    const m = mRaw ? mRaw.slice(0, 2) : "00";
    const period = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return { h: h.toString().padStart(2, "0"), m, period };
  };

  const [time, setTime] = useState(parseTime(value));

  useEffect(() => {
    const h = parseInt(time.h || 0, 10);
    const m = time.m || "00";
    const adjustedH =
      time.period === "PM" && h < 12
        ? h + 12
        : time.period === "AM" && h === 12
        ? 0
        : h;
    const formatted = `${adjustedH.toString().padStart(2, "0")}:${m}`;
    onChange(formatted);
  }, [time, onChange]);

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <div className="time-picker">
      <select
        value={time.h}
        onChange={(e) => setTime((t) => ({ ...t, h: e.target.value }))}
      >
        <option value="">HH</option>
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="time-separator">:</span>
      <select
        value={time.m}
        onChange={(e) => setTime((t) => ({ ...t, m: e.target.value }))}
      >
        <option value="">MM</option>
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={time.period}
        onChange={(e) => setTime((t) => ({ ...t, period: e.target.value }))}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

/* === PollBox === */
function PollBox({ tripId, sectionKey, entryIndex, user }) {
  const userId = user?.sub || "guest";
  const pollKey = `trip.${tripId}.polls.${sectionKey}.${entryIndex}`;
  const [votes, setVotes] = useState(() => {
    try {
      const saved = localStorage.getItem(pollKey);
      return saved ? JSON.parse(saved) : { up: 0, down: 0, voters: {} };
    } catch {
      return { up: 0, down: 0, voters: {} };
    }
  });

  const handleVote = (type) => {
    if (votes.voters[userId]) {
      alert("You've already voted on this item.");
      return;
    }
    const updated = {
      ...votes,
      [type]: (votes[type] || 0) + 1,
      voters: { ...votes.voters, [userId]: type },
    };
    setVotes(updated);
    try {
      localStorage.setItem(pollKey, JSON.stringify(updated));
    } catch {}
  };

  const total = (votes.up || 0) + (votes.down || 0);
  const upPercent = total ? Math.round(((votes.up || 0) / total) * 100) : 0;
  const downPercent = total ? Math.round(((votes.down || 0) / total) * 100) : 0;

  return (
    <div className="poll-box">
      <h5>Poll this item</h5>
      <div className="poll-controls">
        <button onClick={() => handleVote("up")} className="poll-btn up">
          👍 {votes.up} ({upPercent}%)
        </button>
        <button onClick={() => handleVote("down")} className="poll-btn down">
          👎 {votes.down} ({downPercent}%)
        </button>
      </div>
    </div>
  );
}

/* === Floating BudgetWidget === */
function BudgetWidget({
  totalBudget,
  setTotalBudget,
  sectionBudgets,
  setSectionBudgets,
  sections,
  totalAllocated,
  remainingBudget,
  formatLabel,
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [position, setPosition] = useState({ x: null, y: 100 });
  const [size, setSize] = useState({ width: 220, height: 360 });
  const [isMobile, setIsMobile] = useState(false);
  const [navHeight, setNavHeight] = useState(120); // default fallback
  const bodyRef = React.useRef(null);


useEffect(() => {
  // Try to detect your actual nav/header element
  const nav = document.querySelector("nav, .nav-bar, header");

  if (nav) {
    const rect = nav.getBoundingClientRect();
    setNavHeight(rect.height + 20); // +20px padding
  }
}, []);

useEffect(() => {
  if (open && bodyRef.current) {
    const contentHeight = bodyRef.current.scrollHeight;

    // Fit widget on screen while showing full content
    const maxHeight = window.innerHeight - (position.y + 40);

    setSize((prev) => ({
      ...prev,
      height: Math.min(contentHeight + 40, maxHeight), // +40 for padding/header
    }));
  }
}, [open, position.y]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (position.x === null && !isMobile) {
      const defaultWidth = size.width || 280;
      setPosition({
        x: window.innerWidth - defaultWidth - 20,
        y: 100,
      });
    }
  }, [position.x, size.width, isMobile]);

  const handleHeaderMouseDown = (e) => {
    if (pinned || isMobile) return;
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...position };

    const onMouseMove = (moveEvent) => {
      if (typeof window === "undefined") return;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 80;
      setPosition({
        x: Math.min(Math.max(10, startPos.x + dx), maxX),
        y: Math.max(startPos.y + dy, navHeight + 10)


      });
    };

    const onMouseUp = () => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);

  // Snap at end of drag
  setPosition((p) => snapToTop(p));


};


    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleResizeMouseDown = (e) => {
    if (isMobile) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { ...size };

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setSize((prev) => ({
        width: 280, // frozen width
        height: Math.max(220, startSize.height + dy),
      }));



    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const toggleOpen = () => setOpen((o) => !o);
  const togglePinned = (e) => {
    e.stopPropagation();
    setPinned((p) => !p);
  };

  const widgetStyle = {};
  if (!isMobile) {
    if (position.x !== null) {
      widgetStyle.top = position.y;
      widgetStyle.left = position.x;
    }
    widgetStyle.width = size.width;
    if (open) {
      widgetStyle.height = size.height;
    }
  }

  const totalSections = Object.keys(sections).length || 0;


const SNAP_MARGIN = 60; // px sensitivity near left/right edges

const snapToTop = (pos) => {
  if (typeof window === "undefined") return pos;

  const w = size.width;
  const screenW = window.innerWidth;

  let { x, y } = pos;

  // Snap LEFT (top-left)
  if (x < SNAP_MARGIN) {
    x = 20;
    y = navHeight + 10;
  }

  // Snap RIGHT (top-right)
  if (x > screenW - w - SNAP_MARGIN) {
    x = screenW - w - 20;
    y = navHeight + 10;
  }

  // Snap vertically only to top safe zone
  if (y < navHeight + SNAP_MARGIN) {
    y = navHeight + 10;
  }
  

  return { x, y };
  
};

  return (
    <div
      className={`budget-widget ${open ? "open" : "closed"} ${
        pinned ? "pinned" : "unpinned"
      } ${isMobile ? "mobile" : "desktop"}`}
      style={widgetStyle}
    >
      <div
        className="budget-widget-header"
      >
        <button
          type="button"
          className="budget-widget-title"
          onClick={toggleOpen}
        >
          Budget
          {totalBudget ? ` • $${totalBudget}` : ""}
        </button>
      </div>

      <div className="budget-widget-shell">
        <div className="budget-widget-body" ref={bodyRef}>
          <div className="budget-widget-summary">
            <div>
              <span className="budget-label">Total:</span>{" "}
              <input
                type="number"
                value={totalBudget}
                onChange={(e) =>
                  setTotalBudget(Number(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <span className="budget-label">Allocated:</span>{" "}
              <span>${totalAllocated}</span>
            </div>
            <div>
              <span className="budget-label">Remaining:</span>{" "}
              <span
                className={
                  remainingBudget < 0 ? "budget-negative" : "budget-positive"
                }
              >
                ${remainingBudget}
              </span>
            </div>
          </div>

          <div className="budget-widget-sections">
            {Object.keys(sections).map((key) => {
              const value = sectionBudgets[key] || 0;
              const percent =
                totalBudget > 0
                  ? Math.min(100, (value / totalBudget) * 100)
                  : 0;
              return (
                <div key={key} className="budget-widget-row">
                  <div className="budget-widget-row-label">
                    {formatLabel(key)}
                  </div>
                  <div className="budget-widget-row-input">
                    <input
                      type="number"
                      value={value || ""}
                      onChange={(e) =>
                        setSectionBudgets((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value) || 0,
                        }))
                      }
                    />
                    <div className="budget-widget-progress">
                      <div
                        className="budget-widget-progress-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="budget-widget-percent">
                      {totalBudget ? `${percent.toFixed(0)}%` : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
