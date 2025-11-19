import { fetchLandmarkPhoto, DEFAULT_TRIP_PHOTO } from "./photoService";

// ---- Single storage key ----
const TRIPS_KEY = "trips.v1";

// ---- Core persistence helpers (single definitions) ----
function loadTrips() {
  try {
    return JSON.parse(localStorage.getItem(TRIPS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTrips(trips) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));

  // Notify other parts of the app immediately (same-tab)
  try {
    window.dispatchEvent(new StorageEvent("storage", { key: TRIPS_KEY }));
  } catch {
    window.dispatchEvent(new Event("trips.updated"));
  }
}

// Small uid helper (fallback if crypto.randomUUID is unavailable)
function uid() {
  return (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);
}

// ---- Trips API ----
export async function createTrip(partial = {}) {
  const trips = loadTrips();

  const photoData = await fetchLandmarkPhoto(
    partial.city || partial.location || "",
    partial.country || ""
  );

  const trip = {
    id: uid(),
    name: partial.name || "Untitled Trip",
    location: partial.location || "",
    latitude: partial.latitude ?? null,
    longitude: partial.longitude ?? null,
    city: partial.city || "",
    country: partial.country || "",
    dateStart: partial.dateStart || "",
    dateEnd: partial.dateEnd || "",
    photoUrl: photoData?.url || DEFAULT_TRIP_PHOTO,
    photoAttribution: photoData
    ? {
        photographer: photoData.photographer,
        photoLink: photoData.photoLink
      }
    : null,
    useDefaultPhoto: false,
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

// convenience wrapper used by TripDetail
export function updateTripName(id, name) {
  renameTrip(id, name);
}

export function updateTrip(trip) {
  const trips = loadTrips();
  const idx = trips.findIndex((t) => t.id === trip.id);
  if (idx !== -1) {
    trips[idx] = trip;
    saveTrips(trips);
  }
}

// ---- Upsert helper, now exported ----
export function setTripState(updated) {
  const trips = loadTrips();
  const idx = trips.findIndex((t) => t.id === updated.id);
  if (idx === -1) trips.push(updated);
  else trips[idx] = updated;
  saveTrips(trips);
}

// ---- Comments helpers (per trip, per section) ----
function ensureSectionComments(trip, sectionKey) {
  if (!trip.sections) trip.sections = {};
  if (!trip.sections[sectionKey]) trip.sections[sectionKey] = {};
  if (!Array.isArray(trip.sections[sectionKey].comments)) {
    trip.sections[sectionKey].comments = [];
  }
}

export function listComments(tripId, sectionKey) {
  const trip = getTrip(tripId);
  if (!trip) return [];
  ensureSectionComments(trip, sectionKey);
  return trip.sections[sectionKey].comments;
}

export function addComment(
  tripId,
  sectionKey,
  { userId, userName, avatarUrl, text }
) {
  const trip = getTrip(tripId);
  if (!trip) return null;

  ensureSectionComments(trip, sectionKey);

  const body = String(text || "").trim();
  if (!body) return null;

  const comment = {
    id: uid(),
    userId: userId || "anon",
    userName: userName || "Traveler",
    avatarUrl: avatarUrl || "",
    text: body,
    createdAt: Date.now(),
  };

  trip.sections[sectionKey].comments.push(comment);
  setTripState(trip);
  return comment;
}

export function deleteComment(tripId, sectionKey, commentId) {
  const trip = getTrip(tripId);
  if (!trip) return false;

  ensureSectionComments(trip, sectionKey);

  const arr = trip.sections[sectionKey].comments;
  const idx = arr.findIndex((c) => c.id === commentId);
  if (idx === -1) return false;

  arr.splice(idx, 1);
  setTripState(trip);
  return true;
}
