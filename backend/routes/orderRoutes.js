import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { checkoutRateLimiter } from "../middleware/rateLimiter.js";
import { csrfProtection } from "../middleware/csrfProtection.js";

const router = express.Router();

/**
 * POST /api/orders/
 * Create a new order
 * Rate limited: 10 attempts per 5 minutes
 * Requires: authentication, CSRF token
 */
router.post(
  "/",
  authMiddleware,
  checkoutRateLimiter,
  csrfProtection,
  createOrder,
);

/**
 * GET /api/orders/my-orders
 * Get user's orders
 */
router.get("/my-orders", authMiddleware, getMyOrders);

/**
 * GET /api/orders/:id
 * Get order by ID (user can only see their own, admin can see any)
 */
router.get("/:id", authMiddleware, getOrderById);

/**
 * PUT /api/orders/:id
 * Update order status
 */
router.put("/:id", authMiddleware, csrfProtection, updateOrderStatus);

/**
 * Admin Routes
 */

/**
 * PUT /api/orders/:id/status
 * Update order status (admin only)
 */
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  csrfProtection,
  updateOrderStatus,
);

/**
 * GET /api/orders/admin/all-orders
 * Get all orders (admin only)
 */
router.get("/admin/all-orders", authMiddleware, adminMiddleware, getAllOrders);

export default router;
