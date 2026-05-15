const buckets = new Map();

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
};

module.exports = function createRateLimiter({
  keyPrefix = "global",
  windowMs = 60 * 1000,
  max = 60,
  message = "Too many requests. Please try again shortly.",
} = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const clientKey = `${keyPrefix}:${getClientIp(req)}`;
    const existingBucket = buckets.get(clientKey);

    if (!existingBucket || now >= existingBucket.resetAt) {
      buckets.set(clientKey, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (existingBucket.count >= max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existingBucket.resetAt - now) / 1000)
      );

      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ error: message });
    }

    existingBucket.count += 1;
    buckets.set(clientKey, existingBucket);
    return next();
  };
};
