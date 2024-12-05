import mongoose from "mongoose";
import app from "./app";
import dotenv from "dotenv";

dotenv.config();

mongoose.set("strictQuery", true);

const port = process.env.PORT || 8000;
const nodeEnv = process.env.NODE_ENV || "development";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const MONGODB_URI = process.env.MONGODB_URI;

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