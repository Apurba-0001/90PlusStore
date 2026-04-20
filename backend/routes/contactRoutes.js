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

router.get("/", (req, res) => {
  res.status(405).json({
    success: false,
    message: "Method not allowed. Use POST /api/contact to send a message.",
    method: req.method,
    path: req.originalUrl,
  });
});

export default router;
