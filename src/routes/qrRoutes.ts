import express from 'express';
import { generateQRCode, trackQRCodeScan } from '../controllers/qrController';

const router = express.Router();

router.post('/generate', generateQRCode);
router.get('/track/:identifier', trackQRCodeScan);

export default router;