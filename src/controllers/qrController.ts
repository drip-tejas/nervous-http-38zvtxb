import { Request, Response } from "express";
import QRCode, { IQRCode } from "../models/QRCode";
import qrcode from "qrcode";

const generateSampleScans = (): IQRCode["scans"] => {
  return Array.from({ length: 50 }, () => ({
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    deviceInfo: ["Mobile", "Desktop", "Tablet"][Math.floor(Math.random() * 3)],
  }));
};

export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { targetUrl, customIdentifier } = req.body;
    const userId = "660a1b3f4c3d1c001f3e4d5e";

    // Check if custom identifier is unique
    const existingQRCode = await QRCode.findOne({ customIdentifier });
    if (existingQRCode) {
      return res
        .status(400)
        .json({ message: "Custom identifier must be unique" });
    }

    const qrCodeInstance = new QRCode({
      user: userId,
      targetUrl,
      customIdentifier,
      scans: generateSampleScans(),
    });

    const qrCodeDataUrl = await qrcode.toDataURL(
      `https://yourapp.com/t/${qrCodeInstance.uniqueIdentifier}`
    );

    await qrCodeInstance.save();

    res.json({
      qrCodeUrl: qrCodeDataUrl,
      uniqueIdentifier: qrCodeInstance.uniqueIdentifier,
    });
  } catch (error) {
    res.status(500).json({ message: "QR Code generation failed" });
  }
};

export const trackQRCodeScan = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const qrCode = await QRCode.findOne({ uniqueIdentifier: identifier });

    if (!qrCode) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    qrCode.scans.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      deviceInfo: req.get("User-Agent") || "Unknown",
    });

    await qrCode.save();

    res.redirect(qrCode.targetUrl);
  } catch (error) {
    res.status(500).json({ message: "Tracking error" });
  }
};

export const getQRCode = async (req: Request, res: Response) => {
  try {
    const qrCode = await QRCode.findOne({ uniqueIdentifier: req.params.id });
    if (!qrCode) return res.status(404).json({ message: "QR code not found" });
    res.json(qrCode);
  } catch (error) {
    res.status(500).json({ message: "Error fetching QR code" });
  }
};

export const scanQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findOne({ uniqueIdentifier: id });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    qrCode.scans.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      deviceInfo: req.get("User-Agent") || "Unknown",
    });

    await qrCode.save();
    res.redirect(qrCode.targetUrl);
  } catch (error) {
    res.status(500).json({ message: "Scan tracking failed" });
  }
};

export const addTestScans = async (req: Request, res: Response) => {
  try {
    const qrCode = await QRCode.findOne({ uniqueIdentifier: req.params.id });
    if (!qrCode) return res.status(404).json({ message: "QR code not found" });

    qrCode.scans = generateSampleScans();
    await qrCode.save();
    res.json({ message: "Test scans added" });
  } catch (error) {
    res.status(500).json({ message: "Error adding test scans" });
  }
};
