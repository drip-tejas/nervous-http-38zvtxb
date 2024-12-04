// /backend/src/routes/qrRoutes.ts
import express from 'express';
import { 
  generateQRCode, 
  listQRCodes,
  getQRCode, 
  updateQRCodeUrl, 
  redirectAndTrackScan,
  trackScan,
  deleteQRCode 
} from '../controllers/qrController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.post("/generate", authMiddleware, generateQRCode as any);
router.get("/list", authMiddleware, listQRCodes as any);
router.get("/:id", authMiddleware, getQRCode as any);
router.put("/:id/url", authMiddleware, updateQRCodeUrl as any);
router.delete("/:id", authMiddleware, deleteQRCode as any);

// Public routes
router.get("/redirect/:id", redirectAndTrackScan as any);
router.get("/scan/:id", trackScan as any);

export default router;