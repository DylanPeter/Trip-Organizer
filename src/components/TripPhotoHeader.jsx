import { DEFAULT_TRIP_PHOTO, fetchLandmarkPhoto } from "../utils/photoService";
import { getTrip } from "../utils/tripstore";

export default function TripPhotoHeader({ trip, onPhotoChange }) {
  const handleDefault = () => onPhotoChange(DEFAULT_TRIP_PHOTO);

  const handleRefetch = async () => {
    const newPhoto = await fetchLandmarkPhoto(trip.city, trip.country);
    onPhotoChange(newPhoto);
  };

  return (
    <div
      className="trip-photo-header"
      style={{
        width: "100%",
        height: "200px",
        borderRadius: "12px",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage: `url(${trip.photoUrl})`,
        position: "relative",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          display: "flex",
          gap: "8px",
        }}
      >
        <button onClick={handleRefetch} className="nav-item">
          🔄 New Photo
        </button>
        <button onClick={handleDefault} className="nav-item">
          🌅 Default
        </button>
      </div>
    </div>
  );
}
