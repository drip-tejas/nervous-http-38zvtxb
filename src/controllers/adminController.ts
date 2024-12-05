// /backend/src/controllers/adminController.ts
/* 
import { Request, Response } from "express";
import { User } from "../models/User";

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
*/