import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getTrip } from "../utils/tripstore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
    fetchPlaces(true);
    // eslint-disable-next-line
  }, [category, tripId]);

  async function fetchPlaces(reset = false) {
    setIsLoading(true);
    setError("");
    try {
      const url = `https://api.geoapify.com/v2/places?categories=${cat.api}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=10&offset=${reset ? 0 : offset}&apiKey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const newPlaces = data.features.map((f) => f.properties);
      setPlaces((prev) => (reset ? newPlaces : [...prev, ...newPlaces]));
      setOffset((o) => (reset ? 10 : o + 10));
    } catch (err) {
      setError("Failed to load places. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

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
          <MapContainer center={[lat, lon]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.geoapify.com/">Geoapify</a>'
              url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`}
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
        <button className="cta-btn" onClick={() => fetchPlaces(false)}>
          Load More
        </button>
      )}

      
    </main>
  );
}
