// src/index.ts
import mongoose from "mongoose";
import app from "./app";
import dotenv from "dotenv";

dotenv.config();
mongoose.set("strictQuery", true);

const port = parseInt(process.env.PORT || '80', 10);
const nodeEnv = process.env.NODE_ENV || "development";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const MONGODB_URI = process.env.MONGODB_URI;

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port} in ${nodeEnv} mode`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();