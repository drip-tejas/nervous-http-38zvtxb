// /backend/src/routes/adminRoutes.ts
/*
import express, { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

const router = express.Router();

const ADMIN_TOKEN = "test-admin-token-123"; // Hardcode for testing

// Define middleware types properly
const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const adminToken =
    req.headers.authorization?.replace("Bearer ", "") ||
    req.header("admin-token");
  console.log("Received admin token:", adminToken); // Debug log
  console.log("Expected admin token:", ADMIN_TOKEN); // Debug log

  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

// Define controller with proper types
const resetTestAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    // Delete all test accounts
    await User.deleteOne({ email: "test@example.com" });

    // Create new test account
    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "qqqqqqqq",
    });

    await testUser.save();

    res.status(200).json({
      success: true,
      message: "Test account created",
      credentials: {
        email: "test@example.com",
        password: "qqqqqqqq",
      },
    });
  } catch (error: any) {
    console.error("Setup test account error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Use proper middleware types
router.post(
  "/reset-test-account",
  adminAuth as express.RequestHandler,
  resetTestAccount as express.RequestHandler
);

export default router;
*/