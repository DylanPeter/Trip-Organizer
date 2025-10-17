import { Link } from "react-router-dom";
import "./Trips.css";

export default function Trips() {
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
