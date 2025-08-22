const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

const STORAGE_HINT_KEY = "auth_storage"; // "local" | "session"

/** Pick the storage based on remember flag; fall back to previous hint. */
function getStorage(remember?: boolean): Storage {
  if (typeof window === "undefined") return localStorage; // SSR safety
  if (remember === true) return localStorage;
  if (remember === false) return sessionStorage;
  const hint = localStorage.getItem(STORAGE_HINT_KEY);
  return hint === "session" ? sessionStorage : localStorage;
}

export function setTokens(
  accessToken: string,
  refreshToken: string,
  remember: boolean
) {
  const storage = getStorage(remember);
  storage.setItem("accessToken", accessToken);
  storage.setItem("refreshToken", refreshToken);
  // write the hint in localStorage so other tabs know which storage to read
  localStorage.setItem(STORAGE_HINT_KEY, remember ? "local" : "session");
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  // try both storages to be safe
  return (
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken")
  );
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("refreshToken") ||
    localStorage.getItem("refreshToken")
  );
}

export function clearTokens() {
  try {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  } catch {}
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem(STORAGE_HINT_KEY);
  } catch {}
}

/** Call /auth/refresh and update storage in place. */
export async function refreshAccessToken(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  } = await res.json();

  // preserve existing “remember” choice by seeing where refresh was stored
  const remember =
    (localStorage.getItem(STORAGE_HINT_KEY) ?? "local") === "local";
  setTokens(data.access_token, data.refresh_token, remember);
  return data.access_token;
}
