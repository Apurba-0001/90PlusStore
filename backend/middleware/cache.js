import { getRedisClient } from "../config/redis.js";

/**
 * Generate structured cache key based on route
 */
const generateCacheKey = (req) => {
  const url = req.originalUrl || req.url;
  const params = req.params;
  const query = req.query;

  // Product detail: /api/products/:id
  if (
    params.id &&
    url.includes("/api/products/") &&
    !url.includes("/reviews")
  ) {
    return `product:${params.id}`;
  }

  // Product reviews: /api/products/:id/reviews
  if (params.id && url.includes("/reviews")) {
    return `product:${params.id}:reviews`;
  }

  // Featured products: /api/products/featured
  if (url.includes("/api/products/featured")) {
    return "products:featured";
  }

  // Categories: /api/products/categories
  if (url.includes("/api/products/categories")) {
    return "products:categories";
  }

  // Product list with filters: /api/products?category=Jerseys&page=1
  if (url.startsWith("/api/products")) {
    const serializedQuery = JSON.stringify({
      category: query.category || null,
      search: query.search || null,
      gender: query.gender || null,
      size: query.size || null,
      page: query.page || 1,
      limit: query.limit || 10,
    });
    return `products:all:${Buffer.from(serializedQuery).toString("base64")}`;
  }

  // Fallback to URL-based key
  return `cache:${url}`;
};

/**
 * Cache middleware - caches GET requests with structured keys
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 */
export const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const redisClient = getRedisClient();

    // If Redis is not connected, skip caching
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    try {
      // Generate structured cache key
      const key = generateCacheKey(req);

      // Try to get cached response
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        console.log(`✅ Cache HIT: ${key}`);
        return res.json(JSON.parse(cachedResponse));
      }

      console.log(`❌ Cache MISS: ${key}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (body) => {
        // Cache the response
        redisClient
          .setEx(key, duration, JSON.stringify(body))
          .then(() => console.log(`💾 Cached: ${key} for ${duration}s`))
          .catch((err) => console.error("Cache save error:", err));

        // Send the original response
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

/**
 * Clear specific product from cache
 * @param {string} productId - Product ID
 */
export const clearProductCache = async (productId) => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) {
    return;
  }

  try {
    const keysToDelete = [
      `product:${productId}`,
      `product:${productId}:reviews`,
    ];

    const deleted = await redisClient.del(keysToDelete);
    if (deleted > 0) {
      console.log(`🗑️ Cleared cache for product: ${productId}`);
    }
  } catch (error) {
    console.error("Clear product cache error:", error);
  }
};

/**
 * Clear all product list caches (searches, filters, featured, categories)
 */
export const clearProductListCaches = async () => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) {
    return;
  }

  try {
    const patterns = [
      "products:all:*",
      "products:featured",
      "products:categories",
    ];
    let totalDeleted = 0;

    for (const pattern of patterns) {
      if (pattern.includes("*")) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          totalDeleted += keys.length;
        }
      } else {
        const deleted = await redisClient.del(pattern);
        totalDeleted += deleted;
      }
    }

    if (totalDeleted > 0) {
      console.log(`🗑️ Cleared ${totalDeleted} product list cache entries`);
    }
  } catch (error) {
    console.error("Clear product list caches error:", error);
  }
};

/**
 * Clear featured products cache only
 */
export const clearFeaturedCache = async () => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) {
    return;
  }

  try {
    const deleted = await redisClient.del("products:featured");
    if (deleted > 0) {
      console.log("🗑️ Cleared featured products cache");
    }
  } catch (error) {
    console.error("Clear featured cache error:", error);
  }
};

/**
 * Clear cache by pattern (for backward compatibility)
 * @param {string} pattern - Redis key pattern
 */
export const clearCache = async (pattern) => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) {
    return;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(
        `🗑️ Cleared ${keys.length} cache entries matching: ${pattern}`,
      );
    }
  } catch (error) {
    console.error("Clear cache error:", error);
  }
};
