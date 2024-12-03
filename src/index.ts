// src/index.ts
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import qrRoutes from "./routes/qrRoutes";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";

mongoose.set("strictQuery", true);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const MONGODB_URI = process.env.MONGODB_URI;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Add test route before other routes
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

// Use single mount point for API routes
app.use("/api/qr", qrRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
