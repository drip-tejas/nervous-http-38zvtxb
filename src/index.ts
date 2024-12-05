import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import qrRoutes from "./routes/qrRoutes";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";

dotenv.config();

mongoose.set("strictQuery", true);

const app = express();
const port = process.env.PORT || 8000;
const nodeEnv = process.env.NODE_ENV || "development";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const MONGODB_URI = process.env.MONGODB_URI;

// Configure CORS based on environment
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    environment: nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Database test endpoint
app.get("/test", async (req, res) => {
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
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: nodeEnv === "production" ? "Internal server error" : err.message,
    });
  }
);

// Start server function
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(port, () => {
      console.log(`Server running on port ${port} in ${nodeEnv} mode`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
