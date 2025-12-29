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
} from "../controllers/productController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/featured", getFeaturedProducts);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/:id/reviews", getProductReviews);

// Review routes
router.post("/:id/reviews", authMiddleware, addReview);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
router.patch(
  "/:id/featured",
  authMiddleware,
  adminMiddleware,
  toggleFeaturedProduct
);

export default router;
