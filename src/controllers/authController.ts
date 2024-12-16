// /backend/src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

// Define custom request interfaces
interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    name: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Helper function to generate tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { _id: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" }  // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { _id: userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }   // Long-lived refresh token
  );

  return { accessToken, refreshToken };
};

// Helper function to validate email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get current user
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id)
      .select("-password -refreshTokens");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

// Register new user
export const register = async (
  req: RegisterRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({ 
        error: "All fields are required",
        missing: {
          email: !email,
          password: !password,
          name: !name
        }
      });
      return;
    }

    // Email validation
    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    // Password validation
    if (password.length < 8) {
      res.status(400).json({ 
        error: "Password must be at least 8 characters long"
      });
      return;
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Send response
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token: accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error("Registration error:", {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ 
      error: "Registration failed",
      message: error.message 
    });
  }
};

// Login user
export const login = async (
  req: LoginRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Send response
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Refresh token
export const refresh = async (
  req: RefreshTokenRequest,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token required" });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { _id: string };

    // Find user
    const user = await User.findById(decoded._id);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

// Logout
export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Clear refresh tokens if you're storing them in DB
    // await User.findByIdAndUpdate(req.user?._id, { $set: { refreshTokens: [] } });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};