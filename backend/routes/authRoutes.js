import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getWishlist,
  toggleWishlist,
  getAllUsers,
  removeUser,
} from "../controllers/authController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import {
  loginRateLimiter,
  signupRateLimiter,
  apiRateLimiter,
} from "../middleware/rateLimiter.js";
import {
  validateEmail,
  validatePassword,
  handleValidationErrors,
} from "../middleware/validation.js";
import {
  csrfProtection,
  attachCsrfToken,
} from "../middleware/csrfProtection.js";
import { logAdminAction } from "../middleware/securityLogging.js";

const router = express.Router();

// User Authentication Routes
/**
 * POST /api/auth/register
 * Register a new user
 * Rate limited: 10 attempts per hour
 */
router.post(
  "/register",
  signupRateLimiter,
  validateEmail,
  validatePassword,
  handleValidationErrors,
  register,
);

/**
 * POST /api/auth/login
 * Login user
 * Rate limited: 5 attempts per minute
 */
router.post(
  "/login",
  loginRateLimiter,
  validateEmail,
  handleValidationErrors,
  login,
);

/**
 * GET /api/auth/profile
 * Get user profile (requires auth)
 */
router.get("/profile", authMiddleware, getProfile);

/**
 * GET /api/auth/csrf-token
 * Refresh CSRF token for authenticated user
 */
router.get("/csrf-token", authMiddleware, attachCsrfToken, (req, res) => {
  res.json({
    success: true,
    csrfToken: res.locals.csrfToken,
  });
});

/**
 * PUT /api/auth/profile
 * Update user profile (requires auth)
 */
router.put("/profile", authMiddleware, csrfProtection, updateProfile);

// Cart Routes
/**
 * GET /api/auth/cart
 * Get user cart
 */
router.get("/cart", authMiddleware, getCart);

/**
 * POST /api/auth/cart
 * Add item to cart
 */
router.post("/cart", authMiddleware, csrfProtection, addToCart);

/**
 * PATCH /api/auth/cart/:productId
 * Update cart item quantity
 */
router.patch(
  "/cart/:productId",
  authMiddleware,
  csrfProtection,
  updateCartQuantity,
);

/**
 * DELETE /api/auth/cart/:productId
 * Remove item from cart
 */
router.delete(
  "/cart/:productId",
  authMiddleware,
  csrfProtection,
  removeFromCart,
);

/**
 * DELETE /api/auth/cart
 * Clear entire cart
 */
router.delete("/cart", authMiddleware, csrfProtection, clearCart);

// Wishlist Routes
/**
 * GET /api/auth/wishlist
 * Get user wishlist
 */
router.get("/wishlist", authMiddleware, getWishlist);

/**
 * PATCH /api/auth/wishlist/:productId
 * Toggle product in wishlist
 */
router.patch(
  "/wishlist/:productId",
  authMiddleware,
  csrfProtection,
  toggleWishlist,
);

// Admin Routes
/**
 * GET /api/auth/users
 * Get all users (admin only)
 * Also returns CSRF token for admin operations
 */
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  attachCsrfToken,
  getAllUsers,
);

/**
 * DELETE /api/auth/users/:id
 * Remove a user (admin only)
 */
router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  csrfProtection,
  (req, res, next) => {
    // Log admin action
    logAdminAction(req.userId, "delete_user", req.params.id, {
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    next();
  },
  removeUser,
);

// SECURITY NOTE: The /api/auth/make-admin endpoint has been REMOVED
// This was a critical security vulnerability allowing privilege escalation
// Admin accounts must be created through secure backend processes only

export default router;
