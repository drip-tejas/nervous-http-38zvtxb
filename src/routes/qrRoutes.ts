// src/routes/qrRoutes.ts

import express from "express";
import {
  generateQRCode,
  trackQRCodeScan,
  getQRCode,
  scanQRCode,
  listQRCodes,
} from "../controllers/qrController";
import {
  getQRCodeAnalytics,
  getGlobalAnalytics,
} from "../controllers/analyticsController";

const router = express.Router();

// Analytics routes - put these FIRST
router.get("/analytics/global", getGlobalAnalytics);
router.get("/analytics/:id", getQRCodeAnalytics);

// QR code routes
router.get("/qr/list", listQRCodes);
router.post("/generate", generateQRCode);
router.get("/track/:identifier", trackQRCodeScan);
router.get("/scan/:id", scanQRCode);
router.get("/:id", getQRCode); // Keep this generic route last

export default router;
