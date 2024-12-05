import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import qrRoutes from "./routes/qrRoutes";
import authRoutes from "./routes/authRoutes";

// Load environment variables
dotenv.config();

const app = express();
const nodeEnv = process.env.NODE_ENV || "development";
const corsOrigin = process.env.CORS_ORIGIN || "*";

// Middleware setup
app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    environment: nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Database test endpoint
app.get("/test", async (_req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database not connected");
    }
    await db.admin().ping();
    res.json({ status: "Database connected" });
  } catch (error) {
    res.status(500).json({ status: "Database error", error });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/qr", qrRoutes);

// Global error handler
const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: nodeEnv === "production" ? "Internal server error" : err.message,
  });
};

app.use(errorHandler);

export default app;
