import express from "express";
import {
  generateQRCode,
  trackQRCodeScan,
  getQRCode,
  scanQRCode,
  addTestScans,
} from "../controllers/qrController";
import {
  getQRCodeAnalytics,
  getGlobalAnalytics,
} from "../controllers/analyticsController";
const router = express.Router();

router.get("/analytics/global", getGlobalAnalytics);
router.get("/analytics/:id", getQRCodeAnalytics);
router.post("/generate", generateQRCode);
router.get("/track/:identifier", trackQRCodeScan);
router.get("/:id", getQRCode);
router.get("/scan/:id", scanQRCode);
router.post("/test-scans/:id", addTestScans);

export default router;
