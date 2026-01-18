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
import { cache } from "../middleware/cache.js";

const router = express.Router();

// Cache product routes (5 minutes for lists, 10 minutes for individual products)
router.get("/categories", cache(300), getCategories);
router.get("/featured", cache(300), getFeaturedProducts);
router.get("/", cache(180), getAllProducts); // 3 minutes for product lists
router.get("/:id", cache(600), getProductById); // 10 minutes for single product
router.get("/:id/reviews", cache(300), getProductReviews);

// Review routes
router.post("/:id/reviews", authMiddleware, addReview);
router.put(
  "/:id/reviews/:reviewId",
  authMiddleware,
  adminMiddleware,
  updateReview,
);
router.delete(
  "/:id/reviews/:reviewId",
  authMiddleware,
  adminMiddleware,
  deleteReview,
);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
router.patch(
  "/:id/featured",
  authMiddleware,
  adminMiddleware,
  toggleFeaturedProduct,
);

export default router;
