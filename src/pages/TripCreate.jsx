import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createTrip } from "../utils/tripstore";
import "../styles/TripCreate.css";


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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateStart && dateEnd && new Date(dateEnd) < new Date(dateStart)) {
      alert("End date can’t be before start date.");
      return;
    }
    const id = await createTrip({
      name: name.trim() || "Untitled Trip",
      location: selectedLocation?.name || location.trim(),
      latitude: selectedLocation?.lat || null,
      longitude: selectedLocation?.lon || null,
      city: selectedLocation?.city || null,
      country: selectedLocation?.country || null,
      dateStart,
      dateEnd,
      // photoUrl: photoData.url,
      // photoAttribution: {
      //   photographer: photoData.photographer,
      //   photoLink: photoData.photoLink
      // }
    });
    navigate(`/trips/${id}`);
  };

  return (
    <main className="trip-create-page page-container">
    <h1 className="trip-create-title">Create a new trip</h1>
  
    <form onSubmit={handleSubmit} className="trip-create-form">
      
      {/* Trip Name */}
      <label className="trip-field">
        <span>Trip name</span>
        <input
          className="trip-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Paris with friends"
        />
      </label>
  
      {/* Location w/ suggestions */}
      <label className="trip-field location-field">
        <span>Location</span>
        <input
          className="trip-input"
          value={location}
          onChange={(e) => {
            suppressFetchRef.current = false;
            setLocation(e.target.value);
            setSelectedLocation(null);
          }}
          placeholder="City, Country"
          autoComplete="off"
        />
  
        {isLoading && suggestions.length === 0 && (
          <div className="location-loading">🔍 Looking up places...</div>
        )}
  
        {suggestions.length > 0 && (
          <ul className="location-suggestions">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="location-suggestion-item"
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
  
      {/* Dates */}
      <div className="trip-date-row">
        <label className="trip-field">
          <span>Start date</span>
          <input
            type="date"
            className="trip-input"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
        </label>
  
        <label className="trip-field">
          <span>End date</span>
          <input
            type="date"
            className="trip-input"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            min={dateStart || undefined}
          />
        </label>
      </div>
  
      {/* Buttons */}
      <div className="trip-buttons">
        <button type="submit" className="trip-btn-primary">Create trip</button>
        <button type="button" className="trip-btn-secondary" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
  
    </form>
  </main>
  );
}