import { NextRequest } from "next/server";

interface RateEntry { count: number; resetAt: number }
const store = new Map<string, RateEntry>();

// Returns true if request is allowed, false if rate-limited.
// NOTE: in-memory — resets per cold start on serverless. Adequate for basic abuse prevention.
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

export function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
