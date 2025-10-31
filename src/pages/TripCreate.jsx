import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createTrip } from "../utils/tripstore";

export default function TripCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState("My Next Adventure");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const cacheRef = useRef({});
  const suppressFetchRef = useRef(false);

  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) { // blocks short inputs
      setSuggestions([]);
      return;
    }
    // check cache before calling API
    if (cacheRef.current[query]) {
      setSuggestions(cacheRef.current[query]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&apiKey=${apiKey}`
      );
      const data = await response.json();
      const results = data.features.map(f => f.properties);
      cacheRef.current[query] = results; // save to cache
      setSuggestions(results);
    } catch (err) {
      console.error("Geoapify fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(location);
    }, 400); // wait 400ms after typing stops
    return () => clearTimeout(handler);
  }, [location]);

  useEffect(() => {
    if (!debouncedQuery || suppressFetchRef.current) return;
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateStart && dateEnd && new Date(dateEnd) < new Date(dateStart)) {
      alert("End date can’t be before start date.");
      return;
    }
    const id = createTrip({
      name: name.trim() || "Untitled Trip",
      location: selectedLocation?.name || location.trim(),
      latitude: selectedLocation?.lat || null,
      longitude: selectedLocation?.lon || null,
      city: selectedLocation?.city || null,
      country: selectedLocation?.country || null,
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

          {/* <label>
            <div>Location</div>
            <input
              className="add-item-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
          </label> */}
          <label style={{ position: "relative" }}>
            <div>Location</div>
            <input
              className="add-item-input"
              value={location}
              onChange={(e) => {
                suppressFetchRef.current = false;
                setLocation(e.target.value); //fetch happens via debounce
                setSelectedLocation(null); // clear old selection if typing again
              }}
              placeholder="City, Country"
              autoComplete="off"
            />
            {isLoading && suggestions.length === 0 && (
              <div style={{ fontSize: "0.85rem", color: "#777" }}>🔍 Looking up places...</div>
            )}
            {suggestions.length > 0 && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #ccc",
                  borderRadius: "0.25rem",
                  zIndex: 10,
                  maxHeight: "10rem",
                  overflowY: "auto",
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                }}
              >
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                    onClick={() => {
                      suppressFetchRef.current = true;
                      setLocation(s.formatted);
                      setSelectedLocation({
                        name: s.formatted,
                        lat: s.lat,
                        lon: s.lon,
                        city: s.city,
                        country: s.country,
                      });
                      setSuggestions([]);
                    }}
                  >
                    {s.formatted}
                  </li>
                ))}
              </ul>
            )}
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