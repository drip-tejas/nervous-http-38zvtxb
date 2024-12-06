/*
import express from "express";
import {
  generateQRCode,
  listQRCodes,
  getQRCode,
  updateQRCodeUrl,
  redirectAndTrackScan,
  trackScan,
  deleteQRCode,
} from "../controllers/qrController";
import { authMiddleware } from "../middleware/auth";
import { Request, Response } from "express";

const router = express.Router();

// Protected routes
router.post("/generate", authMiddleware, generateQRCode);
router.get("/list", authMiddleware, listQRCodes);
router.get("/:id", authMiddleware, getQRCode);
router.put("/:id/url", authMiddleware, updateQRCodeUrl);
router.delete("/:id", authMiddleware, deleteQRCode);

// Public routes
router.get("/redirect/:id", redirectAndTrackScan);
router.get("/scan/:id", trackScan);

export default router;
*/

import express from "express";
import {
  generateQRCode,
  listQRCodes,
  getQRCode,
  updateQRCodeUrl,
  redirectAndTrackScan,
  trackScan,
  deleteQRCode,
} from "../controllers/qrController";
import {
  getQRCodeAnalytics,
  getGlobalAnalytics,
} from "../controllers/analyticsController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Protected routes
router.post("/generate", authMiddleware, generateQRCode);
router.get("/list", authMiddleware, listQRCodes);
router.get("/analytics/:id", authMiddleware, getQRCodeAnalytics);
router.get("/analytics", authMiddleware, getGlobalAnalytics);

// Public routes
router.get("/redirect/:id", redirectAndTrackScan);
router.get("/scan/:id", trackScan);

// protected catch-all routes
router.get("/:id", authMiddleware, getQRCode);
router.put("/:id/url", authMiddleware, updateQRCodeUrl);
router.delete("/:id", authMiddleware, deleteQRCode);

export default router;
