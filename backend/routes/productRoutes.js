import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  addReview,
  getProductReviews,
  getFeaturedProducts,
  toggleFeaturedProduct,
  updateReview,
  deleteReview,
} from "../controllers/productController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { searchRateLimiter } from "../middleware/rateLimiter.js";
import { cache } from "../middleware/cache.js";
import { csrfProtection } from "../middleware/csrfProtection.js";

const router = express.Router();

// ============================================================================
// Public Routes (Read-Only, with caching)
// ============================================================================

/**
 * Get product categories
 */
router.get("/categories", cache(300), getCategories);

/**
 * Get featured products
 */
router.get("/featured", cache(300), getFeaturedProducts);

/**
 * Get all products with pagination, filtering, and search
 * Rate limited to prevent scraping: 30 searches per minute
 */
router.get("/", searchRateLimiter, cache(180), getAllProducts); // 3 minutes cache

/**
 * Get single product
 */
router.get("/:id", cache(600), getProductById); // 10 minutes cache

/**
 * Get product reviews
 */
router.get("/:id/reviews", cache(300), getProductReviews);

// ============================================================================
// Review Routes (Authentication Required)
// ============================================================================

/**
 * POST /api/products/:id/reviews
 * Add a review to product
 */
router.post("/:id/reviews", authMiddleware, csrfProtection, addReview);

/**
 * PUT /api/products/:id/reviews/:reviewId
 * Update a review (admin only)
 */
router.put(
  "/:id/reviews/:reviewId",
  authMiddleware,
  adminMiddleware,
  csrfProtection,
  updateReview,
);

/**
 * DELETE /api/products/:id/reviews/:reviewId
 * Delete a review (admin only)
 */
router.delete(
  "/:id/reviews/:reviewId",
  authMiddleware,
  adminMiddleware,
  csrfProtection,
  deleteReview,
);

// ============================================================================
// Admin Routes (Authentication + Admin + CSRF Required)
// ============================================================================

/**
 * POST /api/products/
 * Create a new product (admin only)
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  csrfProtection,
  createProduct,
);

/**
 * PUT /api/products/:id
 * Update a product (admin only)
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  csrfProtection,
  updateProduct,
);

/**
 * DELETE /api/products/:id
 * Delete a product (admin only)
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  csrfProtection,
  deleteProduct,
);

/**
 * PATCH /api/products/:id/featured
 * Toggle featured product (admin only)
 */
router.patch(
  "/:id/featured",
  authMiddleware,
  adminMiddleware,
  csrfProtection,
  toggleFeaturedProduct,
);

export default router;
