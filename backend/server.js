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
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { errorHandler } from "./middleware/auth.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight keep-alive ping (for UptimeRobot)
app.get("/ping", (req, res) => {
  res.status(200).type("text").send("OK");
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection failed:", err.message));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
