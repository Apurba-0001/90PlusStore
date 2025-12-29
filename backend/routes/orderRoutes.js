import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);

// Admin routes
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.get("/admin/all-orders", authMiddleware, adminMiddleware, getAllOrders);

export default router;
