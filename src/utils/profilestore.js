const KEY = 'profile.v1';

export function getProfile() {
  const raw = localStorage.getItem(KEY);
  return raw
    ? JSON.parse(raw)
    : { name: 'Traveler', email: '', bio: '', avatarUrl: '' };
}

export function saveProfile(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
  // keep other tabs/components in sync
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
}