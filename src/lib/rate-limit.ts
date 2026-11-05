// In-memory limiter: fine for a single instance / dev. For multi-instance serverless
// production, swap the Map for Upstash Redis (free tier) behind the same function.
const hits = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return true; }
  h.n += 1;
  return h.n <= max;
}
