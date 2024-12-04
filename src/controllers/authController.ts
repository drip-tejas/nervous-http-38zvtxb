// /backend/src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    console.log('Registration attempt:', { email, name, passwordLength: password?.length });

    // Validation
    if (!email || !password || !name) {
      console.log('Missing fields:', { email: !!email, password: !!password, name: !!name });
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    // Password length check - update to match schema
    if (password.length < 8) { // Changed from 6 to 8
      console.log('Password too short:', password.length);
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email);
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    console.error("Registration error:", {
      error: error.message,
      name: error.name,
      code: error.code
    });
    res.status(400).json({ error: error.message || "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: "Login failed" });
  }
};
