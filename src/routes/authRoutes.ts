// backend/src/routes/authRoutes.ts

import express from "express";
import { RequestHandler } from "express";
import { register, login, getMe } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";
import { RegisterBody, LoginBody } from "../types/express";

const router = express.Router();

// Type assertions for request handlers
const registerHandler: RequestHandler<{}, any, RegisterBody> = register;
const loginHandler: RequestHandler<{}, any, LoginBody> = login;
const getMeHandler: RequestHandler = getMe;

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/me", authMiddleware as RequestHandler, getMeHandler);

export default router;
