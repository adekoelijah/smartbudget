// ✅ Simple in-memory rate limiter
// For production, consider using redis-based rate limiting

const rateLimitStore = new Map();

const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  signup: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
  default: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
};

// ✅ Clear expired entries
const clearExpiredEntries = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
};

// ✅ Generic rate limiter middleware
const rateLimit = (limitType = "default") => {
  return (req, res, next) => {
    const limit = RATE_LIMITS[limitType] || RATE_LIMITS.default;
    const identifier = req.ip || req.connection.remoteAddress; // Use IP or connection address
    const key = `${identifier}:${limitType}`;

    clearExpiredEntries();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: Date.now() + limit.windowMs,
      });
      return next();
    }

    const entry = rateLimitStore.get(key);

    if (entry.count >= limit.maxRequests) {
      const resetTime = Math.ceil((entry.resetTime - Date.now()) / 1000);
      return res.status(429).json({
        message: `Too many requests. Please try again in ${resetTime} seconds.`,
        retryAfter: resetTime,
      });
    }

    entry.count += 1;
    next();
  };
};

export default rateLimit;
