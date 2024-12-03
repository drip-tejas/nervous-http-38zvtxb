// /backend/src/controllers/qrController.ts
import { Request, Response } from "express";
import QRCode, { IQRCode } from "../models/QRCode";
import qrcode from "qrcode";

const validateUrl = (url: string): string => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { targetUrl, customIdentifier } = req.body;
    const userId = req.user._id;

    if (!targetUrl) {
      return res.status(400).json({ message: "Target URL is required" });
    }

    if (customIdentifier) {
      const existingQRCode = await QRCode.findOne({ customIdentifier });
      if (existingQRCode) {
        return res
          .status(400)
          .json({ message: "Custom identifier already exists" });
      }
    }

    const validatedUrl = validateUrl(targetUrl);
    const redirectUrl = `${
      process.env.BASE_URL || "http://localhost:8000"
    }/api/qr/redirect/${customIdentifier || ""}`;
    const qrCodeDataUrl = await qrcode.toDataURL(redirectUrl);

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
    });

    await qrCodeInstance.save();

    res.status(201).json({
      success: true,
      data: {
        qrCodeUrl: qrCodeDataUrl,
        uniqueIdentifier: qrCodeInstance.uniqueIdentifier,
        targetUrl: validatedUrl,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error?.message || "QR Code generation failed" });
  }
};

export const redirectAndTrackScan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findOne({
      $or: [{ uniqueIdentifier: id }, { customIdentifier: id }],
    });

    if (!qrCode) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    qrCode.scans.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      deviceInfo: req.get("User-Agent") || "Unknown",
    });

    await qrCode.save();
    res.redirect(qrCode.currentUrl);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Redirect failed" });
  }
};

export const updateQRCodeUrl = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newUrl } = req.body;
    const userId = req.user._id;

    if (!newUrl) {
      return res.status(400).json({ message: "New URL is required" });
    }

    const qrCode = await QRCode.findOne({ uniqueIdentifier: id, user: userId });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    const validatedUrl = validateUrl(newUrl);

    qrCode.urlHistory.push({
      url: qrCode.currentUrl,
      changedAt: new Date(),
    });

    qrCode.currentUrl = validatedUrl;
    await qrCode.save();

    res.json({
      success: true,
      data: {
        currentUrl: validatedUrl,
        history: qrCode.urlHistory,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Failed to update URL" });
  }
};

export const getQRCode = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const qrCode = await QRCode.findOne({
      uniqueIdentifier: req.params.id,
      user: userId,
    });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    res.json({ success: true, data: qrCode });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error?.message || "Error fetching QR code" });
  }
};

export const listQRCodes = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const qrCodes = await QRCode.find({ user: userId })
      .select(
        "uniqueIdentifier targetUrl currentUrl createdAt scans urlHistory"
      )
      .sort({ createdAt: -1 });

    res.json({ success: true, data: qrCodes });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error?.message || "Error fetching QR codes" });
  }
};

export const deleteQRCode = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const qrCode = await QRCode.findOneAndDelete({
      uniqueIdentifier: req.params.id,
      user: userId,
    });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    res.json({ success: true, message: "QR code deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error?.message || "Error deleting QR code" });
  }
};
