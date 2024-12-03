// src/routes/qrRoutes.ts
import express from "express";
import {
  generateQRCode,
  redirectAndTrackScan,
  getQRCode,
  updateQRCodeUrl,
  listQRCodes,
  addTestScans,
} from "../controllers/qrController";

const router = express.Router();

// QR Code management
router.post("/qr/generate", generateQRCode);
router.get("/qr/list", listQRCodes);
router.get("/qr/:id", getQRCode);
router.put("/qr/:id/url", updateQRCodeUrl);

// Redirect and tracking
router.get("/qr/redirect/:id", redirectAndTrackScan);

// Test routes - Remove in production okay
router.post("/qr/test-scans/:id", addTestScans);

export default router;
