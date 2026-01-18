import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

let redisClient = null;
let isConnected = false;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: false, // Don't auto-reconnect
    },
  });

  redisClient.on("connect", () => {
    isConnected = true;
    console.log("✅ Redis connected");
  });

  redisClient.on("error", (err) => {
    isConnected = false;
    console.error("❌ Redis error:", err.message);
  });

  try {
    await redisClient.connect();
  } catch (err) {
    console.warn("⚠️ Redis not available, caching disabled:", err.message);
    redisClient = null;
  }
} else {
  console.warn("⚠️ REDIS_URL not set, caching disabled");
}

// Export a wrapper that safely handles null client
const safeRedisClient = {
  async get(key) {
    if (!redisClient || !isConnected) return null;
    return redisClient.get(key);
  },
  async setEx(key, ttl, value) {
    if (!redisClient || !isConnected) return null;
    return redisClient.setEx(key, ttl, value);
  },
  async del(key) {
    if (!redisClient || !isConnected) return null;
    return redisClient.del(key);
  },
  async flushAll() {
    if (!redisClient || !isConnected) return null;
    return redisClient.flushAll();
  },
};

export default safeRedisClient;
