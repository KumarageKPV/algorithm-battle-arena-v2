// src/services/tokenStorage.js
// Lightweight helper so all code reads/writes the same keys.
// Stores token in both "access_token" and legacy "jwt" for backward compatibility.

export const TOKEN_KEY = "access_token";
export const LEGACY_TOKEN_KEY = "jwt";

export function setToken(token) {
  if (!token) return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    // keep legacy entry for older code that expects "jwt"
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
    // Optionally, emit a storage-like event so same-tab listeners can pick up change:
    // (storage events only fire across tabs; custom event helps same-tab listeners)
    window.dispatchEvent(new Event("token-changed"));
  } catch (err) {
    console.error("setToken error:", err);
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || null;
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.dispatchEvent(new Event("token-changed"));
  } catch (err) {
    console.error("clearToken error:", err);
  }
}
