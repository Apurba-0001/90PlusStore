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
  makeAdmin,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Cart routes
router.get("/cart", authMiddleware, getCart);
router.post("/cart", authMiddleware, addToCart);
router.patch("/cart/:productId", authMiddleware, updateCartQuantity);
router.delete("/cart/:productId", authMiddleware, removeFromCart);
router.delete("/cart", authMiddleware, clearCart);

// Wishlist routes
router.get("/wishlist", authMiddleware, getWishlist);
router.patch("/wishlist/:productId", authMiddleware, toggleWishlist);

// Admin setup route (for development/setup only)
router.post("/make-admin", makeAdmin);

export default router;
