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
    createdAt: new Date().toISOString(),
    ...partial,
  };
  trips.push(trip);
  saveTrips(trips);
  return trip.id;
}

export function getTrip(id) {
  return loadTrips().find(t => t.id === id) || null;
}

export function getTrips() {
  return loadTrips();
}