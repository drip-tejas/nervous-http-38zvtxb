import express from "express";
import { register, login, getMe } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

interface RegisterRequest extends express.Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

interface LoginRequest extends express.Request {
  body: {
    email: string;
    password: string;
  };
}

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

export default router;
