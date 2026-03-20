import dotenv from "dotenv";
dotenv.config();

// Force Node.js to use Google DNS for MongoDB Atlas SRV lookup
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not loaded. Check your .env file.");
}

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";
import hpp from "hpp";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { errorHandler, authMiddleware } from "./middleware/auth.js";
import { connectRedis } from "./config/redis.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { securityLoggingMiddleware } from "./middleware/securityLogging.js";
import {
  validateJsonBody,
  validateBasePayload,
} from "./middleware/validation.js";

const app = express();

// ============================================================================
// SECURITY: Configure Express for secure operation
// ============================================================================

// 1. Helmet - Set secure HTTP headers (must be early)
// Provides protection against: XSS, clickjacking, MIME sniffing, etc.
app.use(helmet());

// 2. Compression - Reduce response payload size
app.use(compression());

// 3. Request logging - Log all requests
app.use(morgan("combined"));

// 4. Data sanitization - Prevent NoSQL injection
app.use(mongoSanitize());

// 5. XSS Clean - Remove malicious HTML from input
app.use(xssClean());

// 6. HPP - Prevent HTTP parameter pollution attacks
app.use(hpp());

// 7. Limit request body size to prevent DoS attacks
app.use(express.json({ limit: "10kb" })); // 10KB limit for JSON
app.use(express.urlencoded({ limit: "10kb", extended: true })); // 10KB limit for URL-encoded

// 8. Apply additional security headers from custom middleware
app.use(securityHeaders);

// 9. Configure CORS properly
const normalizeOrigin = (origin) =>
  typeof origin === "string" ? origin.replace(/\/+$/, "") : origin;

const envAllowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
      .map((url) => normalizeOrigin(url.trim()))
      .filter(Boolean)
  : [];

const fallbackAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://nine0plusstore.onrender.com",
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:(3000|5173)$/, // Local network IPs in development
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:(3000|5173)$/, // Local network 10.x IPs
  /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}:(3000|5173)$/, // Local network 172.x IPs
];

const allowedOrigins =
  envAllowedOrigins.length > 0 ? envAllowedOrigins : fallbackAllowedOrigins;

const isOriginAllowed = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }
    return normalizeOrigin(allowedOrigin) === normalizedOrigin;
  });
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin header (curl, health checks, server-to-server).
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  exposedHeaders: ["X-CSRF-Token"], // Allow frontend to read CSRF token header
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// 10. Apply security logging
app.use(securityLoggingMiddleware);

// 11. Validate request body is JSON
app.use(validateJsonBody);

// 12. Validate and prevent suspicious payloads
app.use(validateBasePayload);

// 13. Apply global API rate limiting
app.use(apiRateLimiter);

// ============================================================================
// Health Check Endpoints (no auth required)
// ============================================================================

app.get("/ping", (req, res) => {
  res.status(200).type("text").send("OK");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "90PlusStore Backend",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// Database Connection
// ============================================================================

mongoose
  .connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log("✓ MongoDB connected"))
  .catch((err) => {
    console.error("✗ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Redis connection (optional, won't break app if it fails)
connectRedis().catch((err) =>
  console.log("⚠️  Redis connection failed:", err.message),
);

// ============================================================================
// API Routes
// ============================================================================

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);

// ============================================================================
// 404 Handler
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// ============================================================================
// Error Handling Middleware (must be last)
// ============================================================================

app.use(errorHandler);

// ============================================================================
// Start Server
// ============================================================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`
🛡️  90PlusStore Backend running on port ${PORT} (${NODE_ENV})
✓ All security features active
  `);
});
