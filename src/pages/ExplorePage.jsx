import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getTrip } from "../utils/tripstore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet's default icon paths (so marker icons load correctly in Vite/React builds)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function ExplorePage() {
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const trip = getTrip(tripId);
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  const radius = 5000;

  const categoryMap = {
    hotels: {
      api: "accommodation.hotel",
      message: "🛌 Finding places to stay...",
      title: "Nearby Hotels",
    },
    attractions: {
      api: "tourism.attraction",
      message: "🎟️ Looking for places to see...",
      title: "Attractions",
    },
    foodDining: {
      api: "catering.restaurant",
      message: "🤥 Sniffing out good food...",
      title: "Restaurants",
    },
  };

  const cat = categoryMap[category];
  const lat = trip?.latitude;
  const lon = trip?.longitude;

  useEffect(() => {
    if (!cat || !lat || !lon) return;

    async function loadInitial() {
      setIsLoading(true);
      setError("");

      try {
        const url = `https://api.geoapify.com/v2/places?categories=${cat.api}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=10&offset=0&apiKey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        const newPlaces = data.features.map((f) => f.properties);
        setPlaces(newPlaces);
        setOffset(10);
      } catch (err) {
        console.error(err)
        setError("Failed to load places. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInitial();
    // eslint-disable-next-line
  }, [category, tripId, lat, lon, apiKey]);

  const loadMore = useCallback(async () => {
    if (!cat || !lat || !lon) return;

    setIsLoading(true);
    setError("");

    try {
      const url = `https://api.geoapify.com/v2/places?categories=${cat.api}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=10&offset=${offset}&apiKey=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();
      const more = data.features.map((f) => f.properties);

      setPlaces((prev) => [...prev, ...more]);
      setOffset((prev) => prev + 10);
    } catch (err) {
      console.error(err);
      setError("Failed to load more places.");
    } finally {
      setIsLoading(false);
    }
  }, [cat, lat, lon, offset, apiKey]);

  if (!trip)
    return (
      <main className="page-container">
        <h1>Trip not found</h1>
        <Link to="/trips" className="nav-item">← Back</Link>
      </main>
    );

  return (
    <main className="page-container">
      <header>
        <h1>{cat?.title || "Explore"}</h1>
        <p>
          {trip.location} • Radius: {radius / 1000} km
        </p>
      </header>
      <div className="back-to-trips">
        <Link to={`/trips/${tripId}`} className="back-link">
          ← Back to trip
        </Link>
      </div>

      {isLoading && <p style={{ fontStyle: "italic" }}>{cat?.message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {lat && lon && (
        <div style={{ height: "400px", marginBottom: "1rem" }}>
          <MapContainer center={[lat, lon]} zoom={13} style={{ height: "100%", width: "80%", margin: "0 auto" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              reuseTiles={true}
              updateWhenIdle={true}
            />
            <Marker position={[lat, lon]}>
              <Popup>{trip.location}</Popup>
            </Marker>
            {places.map((p, i) => (
              <Marker key={i} position={[p.lat, p.lon]}>
                <Popup>
                  <strong>{p.name || "Unnamed"}</strong>
                  <br />
                  {p.address_line2 || p.formatted}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {places.map((p, i) => (
          <li
            key={i}
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "0.5rem",
            }}
          >
            <strong>{p.name || "Unnamed"}</strong>
            <div>{p.address_line2 || p.formatted}</div>
            {p.distance && <div>{(p.distance / 1000).toFixed(1)} km away</div>}
          </li>
        ))}
      </ul>

      {places.length > 0 && !isLoading && (
        <button className="cta-btn" onClick={loadMore}>
          Load More
        </button>
      )}
    </main>
  );
}
