/**
 * CSRF Protection
 * Uses double-submit cookie pattern or token verification
 */

import crypto from "crypto";

// Store CSRF tokens in memory (in production, use Redis or DB)
const csrfTokens = new Map();
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Cleanup expired tokens every hour
setInterval(
  () => {
    const now = Date.now();
    for (const [token, data] of csrfTokens.entries()) {
      if (now - data.createdAt > TOKEN_EXPIRY) {
        csrfTokens.delete(token);
      }
    }
  },
  60 * 60 * 1000,
);

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (userId) => {
  const token = crypto.randomBytes(32).toString("hex");
  csrfTokens.set(token, {
    userId: userId.toString(), // Convert ObjectId to string
    createdAt: Date.now(),
  });
  return token;
};

/**
 * Verify CSRF token
 */
export const verifyCsrfToken = (token, userId) => {
  const userIdStr = userId.toString();
  const data = csrfTokens.get(token);

  if (!data) {
    console.error(
      `[CSRF] Token not found in store. Token: ${token.substring(0, 10)}...`,
    );
    return false;
  }

  // Check if token belongs to the user
  if (data.userId !== userIdStr) {
    console.error(
      `[CSRF] User ID mismatch. Expected: ${userIdStr}, Got: ${data.userId}`,
    );
    return false;
  }

  // Check if token is not expired
  if (Date.now() - data.createdAt > TOKEN_EXPIRY) {
    csrfTokens.delete(token);
    console.error(
      `[CSRF] Token expired. Age: ${Date.now() - data.createdAt}ms, Expiry: ${TOKEN_EXPIRY}ms`,
    );
    return false;
  }

  // Token is valid - allow reuse for multiple requests until expiry
  // (not a single-use token to support multiple API calls with same token)
  console.log(`[CSRF] Token verified successfully for user ${userIdStr}`);
  return true;
};

/**
 * CSRF validation middleware
 * Applied to state-changing requests (POST, PUT, PATCH, DELETE)
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF check for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip public endpoints (login, register, health check)
  const publicEndpoints = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/health",
    "/api/products", // GET only
    "/ping",
  ];

  if (publicEndpoints.includes(req.path)) {
    return next();
  }

  const token = req.headers["x-csrf-token"] || req.body?._csrf;

  if (!token) {
    console.error(
      `[CSRF] Token missing for ${req.method} ${req.path}`,
      "Headers:",
      Object.keys(req.headers),
      "UserId:",
      req.userId,
    );
    return res.status(403).json({
      success: false,
      message: "CSRF token missing",
    });
  }

  if (!verifyCsrfToken(token, req.userId)) {
    console.error(
      `[CSRF] Invalid token for ${req.method} ${req.path}`,
      "Token:",
      token.substring(0, 10) + "...",
      "UserId:",
      req.userId,
      "UserId type:",
      typeof req.userId,
    );
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  next();
};

/**
 * Middleware to add CSRF token to response
 * Call this to include token in responses that need it
 */
export const attachCsrfToken = (req, res, next) => {
  if (req.userId) {
    const token = generateCsrfToken(req.userId);
    res.locals.csrfToken = token;
    // Also add to response headers
    res.setHeader("X-CSRF-Token", token);
  }
  next();
};
