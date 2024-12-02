import express from "express";
import {
  generateQRCode,
  trackQRCodeScan,
  getQRCode,
  scanQRCode,
} from "../controllers/qrController";
import { getQRCodeAnalytics, getGlobalAnalytics  } from "../controllers/analyticsController";
const router = express.Router();

router.post("/generate", generateQRCode);
router.get("/track/:identifier", trackQRCodeScan);
router.get("/:id", getQRCode);
router.get("/scan/:id", scanQRCode);
router.get('/analytics/global', getGlobalAnalytics);
router.get("/analytics/:id", getQRCodeAnalytics);

export default router;
