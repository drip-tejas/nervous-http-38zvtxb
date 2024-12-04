// /backend/src/routes/qrRoutes.ts
import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  generateQRCode,
  redirectAndTrackScan,
  getQRCode,
  updateQRCodeUrl,
  listQRCodes,
  trackScan,
} from "../controllers/qrController";

const router = express.Router();

router.post("/generate", authMiddleware, generateQRCode);
router.get("/list", authMiddleware, listQRCodes);
router.get("/:id", authMiddleware, getQRCode);
router.put("/:id/url", authMiddleware, updateQRCodeUrl);
router.get("/redirect/:id", redirectAndTrackScan);
router.get("/scan/:id", trackScan);

export default router;
