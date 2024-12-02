import express from 'express';
import { generateQRCode, trackQRCodeScan } from '../controllers/qrController';

const router = express.Router();

router.post('/generate', generateQRCode);
router.get('/track/:identifier', trackQRCodeScan);
router.get('/:id', getQRCode);

export default router;