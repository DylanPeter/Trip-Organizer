const KEY = "profile.v1";

export function getProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw
      ? JSON.parse(raw)
      : { name: "", email: "", bio: "", avatarUrl: "" };
  } catch {
    return { name: "", email: "", bio: "", avatarUrl: "" };
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    // optional: notify listeners
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  } catch (err) {
    if (err.name === "QuotaExceededError") {
      console.warn("Avatar image too large to save, stripping avatarUrl.", err);
      // strip avatar and try again so other fields still save
      const { avatarUrl, ...rest } = profile;
      localStorage.setItem(KEY, JSON.stringify(rest));
      window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
      // you could also surface a nicer UI message instead of alert
      alert("Your avatar image is too large to save. Other profile info was saved.");
    } else {
      throw err;
    }
  }
}