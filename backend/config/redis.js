import { createClient } from "redis";

let redisClient = null;
let loggedReady = false;

export const connectRedis = async () => {
  try {
    if (!process.env.REDIS_URL) {
      console.log("⚠️ Redis URL not found. Running without cache.");
      return null;
    }

    if (redisClient?.isOpen) {
      return redisClient;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          return Math.min(retries * 300, 3000);
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("🔄 Connecting to Redis...");
    });

    redisClient.on("ready", () => {
      if (!loggedReady) {
        console.log("✅ Redis connected");
        loggedReady = true;
      }
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    return null;
  }
};

export const getRedisClient = () => redisClient;

export const disconnectRedis = async () => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    console.log("Redis disconnected");
  }
};
