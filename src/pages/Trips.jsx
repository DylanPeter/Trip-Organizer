import { Link } from "react-router-dom";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  // load on mount
  useEffect(() => {
    setTrips(getTrips());
  }, []);

  // keep page in sync if localStorage changes in another tab/window
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "trips.v1") setTrips(getTrips());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleCreate = () => {
    const id = createTrip({ name: "New Trip" });
    setTrips(getTrips());      // refresh list
    navigate(`/trips/${id}`);  // jump into it
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this trip?")) return;
    deleteTrip(id);
    setTrips(getTrips());
  };

  const handleRename = (id, current) => {
    const name = prompt("Trip name:", current);
    if (name && name.trim()) {
      renameTrip(id, name.trim());
      setTrips(getTrips());
    }
  };

  return (
    <main className="trips-container">
      <h1 className="trips-title">Trips</h1>
      <div className="trips-card">
        <p className="trips-message">No trips yet.</p>
        <button className="trips-button">+ Start Planning</button>
        <p className="trips-note">
          (Later this will create a new trip and open the checklist page.)
        </p>
        <p className="trips-link">
          <Link to="/">Back to Landing</Link>
        </p>
      </div>
    </main>
  );
}
