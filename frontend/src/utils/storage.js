export const STORAGE_KEYS = {
  auth: "schemesaathi_auth",
  users: "schemesaathi_users",
  language: "schemesaathi_language",
};

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
