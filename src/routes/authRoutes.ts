// /backend/src/routes/authRoutes.ts
import express from "express";
import { register, login, getMe } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/register", register as express.RequestHandler);
router.post("/login", login as express.RequestHandler);
router.get(
  "/me",
  authMiddleware as express.RequestHandler,
  getMe as express.RequestHandler
);

export default router;
