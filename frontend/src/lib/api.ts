// src/lib/api.ts
import { getAccessToken, refreshAccessToken, setTokens } from "./validation/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

type Options = RequestInit & { retryOn401?: boolean };

export async function apiFetch(path: string, opts: Options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  // Pull out our custom flag so it doesn't get passed to fetch
  const { retryOn401 = true, headers: hdrs, ...init } = opts;

  // Build headers (and keep them mutable for retry)
  const headers = new Headers(hdrs ?? {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // First attempt
  let res = await fetch(url, { ...init, headers });

  // One silent refresh on 401
  if (res.status === 401 && retryOn401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(url, { ...init, headers }); // retry with fresh token
    }
  }

  return res;
}

export { setTokens };
