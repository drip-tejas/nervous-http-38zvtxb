// src/controllers/qrController.ts
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

const validateUrl = (url: string): string => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { targetUrl, customIdentifier } = req.body;
    const userId = "660a1b3f4c3d1c001f3e4d5e"; // TODO: Get from auth

    if (!targetUrl) {
      return res.status(400).json({ message: "Target URL is required" });
    }

    // Validate custom identifier if provided
    if (customIdentifier) {
      const existingQRCode = await QRCode.findOne({ customIdentifier });
      if (existingQRCode) {
        return res
          .status(400)
          .json({ message: "Custom identifier must be unique" });
      }
    }

    const validatedUrl = validateUrl(targetUrl);

    const qrCodeInstance = new QRCode({
      user: userId,
      targetUrl: validatedUrl,
      currentUrl: validatedUrl,
      customIdentifier,
      urlHistory: [
        {
          url: validatedUrl,
          changedAt: new Date(),
        },
      ],
      scans: generateSampleScans(), // TODO: Remove in production
    });

    // Generate QR code with redirect URL
    const qrCodeDataUrl = await qrcode.toDataURL(
      `${process.env.BASE_URL || "https://yourapp.com"}/api/qr/redirect/${
        qrCodeInstance.uniqueIdentifier
      }`
    );

    await qrCodeInstance.save();

    res.json({
      qrCodeUrl: qrCodeDataUrl,
      uniqueIdentifier: qrCodeInstance.uniqueIdentifier,
      targetUrl: validatedUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "QR Code generation failed" });
  }
};

export const redirectAndTrackScan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findOne({ uniqueIdentifier: id });

    if (!qrCode) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    // Track the scan
    qrCode.scans.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      deviceInfo: req.get("User-Agent") || "Unknown",
    });

    await qrCode.save();
    res.redirect(qrCode.currentUrl);
  } catch (error) {
    res.status(500).json({ message: "Redirect failed" });
  }
};

export const updateQRCodeUrl = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newUrl } = req.body;

    if (!newUrl) {
      return res.status(400).json({ message: "New URL is required" });
    }

    const qrCode = await QRCode.findOne({ uniqueIdentifier: id });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    const validatedUrl = validateUrl(newUrl);

    // Add to URL history
    qrCode.urlHistory.push({
      url: qrCode.currentUrl,
      changedAt: new Date(),
    });

    qrCode.currentUrl = validatedUrl;
    await qrCode.save();

    res.json({
      message: "URL updated successfully",
      currentUrl: validatedUrl,
      history: qrCode.urlHistory,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update URL" });
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

export const listQRCodes = async (req: Request, res: Response) => {
  try {
    const qrCodes = await QRCode.find()
      .select(
        "uniqueIdentifier targetUrl currentUrl createdAt scans urlHistory"
      )
      .sort({ createdAt: -1 });

    res.json(qrCodes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching QR codes" });
  }
};

// Test endpoint - Remove in production
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
