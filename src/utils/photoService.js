// src/utils/photoService.js
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

// fallback if Unsplash has nothing / looks bad
export const DEFAULT_TRIP_PHOTO =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format";

export async function fetchLandmarkPhoto(city, country) {
  if (!UNSPLASH_ACCESS_KEY || !city) return DEFAULT_TRIP_PHOTO;

  const query = `${city} landmark`;

  try {
    const url =
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&orientation=landscape&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data?.results?.length > 0) {
        const photo = data.results[0];
      return {
        url: photo.urls.regular,
        photographer: photo.user.name,
        photoLink: photo.links.html,
      };
    }
  } catch (err) {
    console.error("Unsplash error:", err);
  }
  

  return DEFAULT_TRIP_PHOTO;
}
