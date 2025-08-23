// src/lib/auth-token.ts
import { getAccessToken } from "@/lib/validation/auth";

type JwtPayload = { sub?: string | number; [k: string]: any };

export function getCurrentUserId(): number | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const [, payloadB64] = token.split(".");
    const json = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8")) as JwtPayload;
    const sub = json?.sub;
    if (typeof sub === "string" && /^\d+$/.test(sub)) return parseInt(sub, 10);
    if (typeof sub === "number") return sub;
    return null;
  } catch {
    return null;
  }
}
