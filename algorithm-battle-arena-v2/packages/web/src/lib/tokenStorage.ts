const TOKEN_KEY = "access_token";
const LEGACY_KEY = "jwt";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_KEY) ?? null;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_KEY, token);
  window.dispatchEvent(new CustomEvent("token-changed"));
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new CustomEvent("token-changed"));
}

