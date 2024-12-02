import express from "express";
import {
  generateQRCode,
  trackQRCodeScan,
  getQRCode,
  scanQRCode,
} from "../controllers/qrController";
const router = express.Router();

router.post("/generate", generateQRCode);
router.get("/track/:identifier", trackQRCodeScan);
router.get("/:id", getQRCode);
router.get("/scan/:id", scanQRCode);

export default router;
