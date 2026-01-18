import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Public route - anyone can view settings (no cache - settings affect pricing)
router.get("/", getSettings);

// Protected admin route - only admins can update
router.put("/", authMiddleware, adminMiddleware, updateSettings);

export default router;
