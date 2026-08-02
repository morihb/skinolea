// Minimal in-memory rate limiter (per IP) for public write endpoints
// like order submission. Good enough for a small store; for higher
// traffic, put this behind a real reverse proxy / CDN rate limiter instead.

const buckets = new Map();

function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const bucket = buckets.get(key) || [];
    const recent = bucket.filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      return res.status(429).json({ error: "Too many requests. Please try again shortly." });
    }
    recent.push(now);
    buckets.set(key, recent);
    next();
  };
}

module.exports = { rateLimit };
