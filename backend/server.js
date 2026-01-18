import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { errorHandler } from "./middleware/auth.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight keep-alive ping (for UptimeRobot)
app.get("/ping", (req, res) => {
  res.status(200).type("text").send("OK");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);

// Root
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "90PlusStore Backend",
    environment: process.env.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ===================== DATABASE + SERVER START ===================== */

// Disable mongoose buffering - queries will fail immediately if not connected
mongoose.set("bufferCommands", false);

mongoose
  .connect(process.env.MONGODB_URI, {
    family: 4, // Force IPv4
  })
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
