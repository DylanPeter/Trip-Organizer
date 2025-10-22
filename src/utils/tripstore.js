const KEY = "trips.v1";

function loadTrips() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function saveTrips(trips) {
  localStorage.setItem(KEY, JSON.stringify(trips));
}
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function createTrip(partial = {}) {
  const trips = loadTrips();
  const trip = {
    id: uid(),
    name: partial.name || "Untitled Trip",
    location: partial.location || "",
    dateStart: partial.dateStart || "",
    dateEnd: partial.dateEnd || "",
    createdAt: new Date().toISOString(),
    ...partial,
  };
  trips.push(trip);
  saveTrips(trips);
  return trip.id;
}

export function getTrip(id) {
  return loadTrips().find((t) => t.id === id) || null;
}

export function getTrips() {
  return loadTrips();
}

export function deleteTrip(id) {
  const next = loadTrips().filter((t) => t.id !== id);
  saveTrips(next);
}

export function renameTrip(id, name) {
  const next = loadTrips().map((t) => (t.id === id ? { ...t, name } : t));
  saveTrips(next);
}

export function updateTripName(id, name) {
  // convenience wrapper used by TripDetail
  renameTrip(id, name);
}