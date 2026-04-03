import express from "express";
import { sendContactMessage } from "../controllers/contactController.js";
import { contactRateLimiter } from "../middleware/rateLimiter.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  validateContactName,
  validateEmail,
  validateContactSubject,
  validateContactMessage,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

/**
 * POST /api/contact
 * Authenticated contact endpoint with strict validation and rate limiting.
 */
router.post(
  "/",
  authMiddleware,
  contactRateLimiter,
  validateContactName,
  validateEmail,
  validateContactSubject,
  validateContactMessage,
  handleValidationErrors,
  sendContactMessage,
);

export default router;
