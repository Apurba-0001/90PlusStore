import redis from "redis";

let redisClient = null;
let redisConnected = false;

// Initialize Redis connection
const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.log(
              "Redis reconnection failed - will use memory store fallback",
            );
            return new Error("Max retries reached");
          }
          return retries * 50;
        },
      },
    });

    redisClient.on("error", (err) => {
      console.log("Redis Client Error:", err.message);
      redisConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("Redis Client Connected");
      redisConnected = true;
    });

    await redisClient.connect();
    redisConnected = true;
  } catch (error) {
    console.log(
      "Redis initialization failed, using in-memory store:",
      error.message,
    );
    redisConnected = false;
  }
};

// Memory-based fallback for rate limiting (when Redis is not available)
const memoryStore = new Map();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of memoryStore.entries()) {
    if (now - data.lastCleanup > 60000) {
      // Clean entries older than 1 minute
      memoryStore.delete(key);
    }
  }
}, 30000);

// Get current count and reset time
const getRequestCount = async (key) => {
  try {
    if (redisConnected && redisClient) {
      const result = await redisClient.get(key);
      return result ? parseInt(result) : 0;
    }
  } catch (error) {
    console.log("Redis get error, falling back to memory store");
    redisConnected = false;
  }

  // Fallback to memory store
  const now = Date.now();
  if (!memoryStore.has(key)) {
    memoryStore.set(key, {
      count: 0,
      resetTime: now + 60000,
      lastCleanup: now,
    });
  }

  const data = memoryStore.get(key);
  if (now > data.resetTime) {
    data.count = 0;
    data.resetTime = now + 60000;
  }
  return data.count;
};

// Increment and set expiration
const incrementRequestCount = async (key, windowSeconds = 60) => {
  try {
    if (redisConnected && redisClient) {
      const value = await redisClient.incr(key);
      if (value === 1) {
        await redisClient.expire(key, windowSeconds);
      }
      return value;
    }
  } catch (error) {
    console.log("Redis incr error, falling back to memory store");
    redisConnected = false;
  }

  // Fallback to memory store
  const now = Date.now();
  if (!memoryStore.has(key)) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
      lastCleanup: now,
    });
    return 1;
  }

  const data = memoryStore.get(key);
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + windowSeconds * 1000;
    return 1;
  }

  data.count++;
  return data.count;
};

/**
 * Rate limiting middleware factory
 * @param {number} maxRequests - Maximum requests allowed in the window
 * @param {number} windowSeconds - Time window in seconds
 * @param {string} keyGenerator - Function to generate rate limit key from request
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (
  maxRequests = 60,
  windowSeconds = 60,
  keyGenerator = (req) => req.ip,
) => {
  return async (req, res, next) => {
    try {
      const key = `ratelimit:${keyGenerator(req)}`;
      const count = await incrementRequestCount(key, windowSeconds);

      // Set headers for client
      res.set("X-RateLimit-Limit", String(maxRequests));
      res.set(
        "X-RateLimit-Remaining",
        String(Math.max(0, maxRequests - count)),
      );
      res.set(
        "X-RateLimit-Reset",
        String(Math.ceil((Date.now() + windowSeconds * 1000) / 1000)),
      );

      if (count > maxRequests) {
        return res.status(429).json({
          success: false,
          message: `Too many requests. Please try again after ${windowSeconds} seconds.`,
          retryAfter: windowSeconds,
        });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      // On error, allow request to pass through
      next();
    }
  };
};

/**
 * Pre-configured rate limiters
 */
export const loginRateLimiter = createRateLimiter(
  5, // 5 attempts
  60, // per 60 seconds
  (req) => `login:${req.body?.email || req.ip}`,
);

export const signupRateLimiter = createRateLimiter(
  10, // 10 attempts
  3600, // per 1 hour
  (req) => `signup:${req.body?.email || req.ip}`,
);

export const checkoutRateLimiter = createRateLimiter(
  10, // 10 checkout attempts
  300, // per 5 minutes
  (req) => `checkout:${req.userId || req.ip}`,
);

export const apiRateLimiter = createRateLimiter(
  100, // 100 requests
  60, // per 60 seconds
  (req) => `api:${req.userId || req.ip}`,
);

export const searchRateLimiter = createRateLimiter(
  30, // 30 searches
  60, // per 60 seconds
  (req) => `search:${req.ip}`,
);

// Initialize Redis on module load
initRedis();

export { redisClient, redisConnected };
