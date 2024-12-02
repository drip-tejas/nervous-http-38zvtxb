import { Request, Response } from 'express';
import QRCode from '../models/QRCode';
import qrcode from 'qrcode';

export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { targetUrl } = req.body;
    const userId = '660a1b3f4c3d1c001f3e4d5e'; // Placeholder user ID

    const qrCodeInstance = new QRCode({
      user: userId,
      targetUrl
    });

    const qrCodeDataUrl = await qrcode.toDataURL(
      `https://yourapp.com/t/${qrCodeInstance.uniqueIdentifier}`
    );



    await qrCodeInstance.save();

    res.json({
      qrCode: qrCodeDataUrl,
      uniqueIdentifier: qrCodeInstance.uniqueIdentifier
    });
  } catch (error) {
    res.status(500).json({ message: 'QR Code generation failed' });
  }
};

export const trackQRCodeScan = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const qrCode = await QRCode.findOne({ uniqueIdentifier: identifier });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    qrCode.scans.push({
        timestamp: new Date(),
      ipAddress: req.ip,
      deviceInfo: req.get('User-Agent')
    });

    await qrCode.save();

    res.redirect(qrCode.targetUrl);
  } catch (error) {
    res.status(500).json({ message: 'Tracking error' });
  }
};

// src/controllers/qrController.ts
export const getQRCode = async (req: Request, res: Response) => {
    try {
      const qrCode = await QRCode.findOne({ uniqueIdentifier: req.params.id });
      if (!qrCode) return res.status(404).json({ message: 'QR code not found' });
      res.json(qrCode);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching QR code' });
    }
  };