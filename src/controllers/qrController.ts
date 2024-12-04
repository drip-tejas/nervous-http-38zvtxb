// /backend/src/controllers/qrController.ts
import { Request, Response } from "express";
import QRCode, { IQRCode } from "../models/QRCode";
import qrcode from "qrcode";
import { getLocationFromIP } from "../utils/geoLocation";

const validateUrl = (url: string): string => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

export const generateQRCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { targetUrl, customIdentifier } = req.body;
    const userId = req.user?._id;

    if (!targetUrl) {
      res.status(400).json({ message: "Target URL is required" });
      return;
    }

    if (customIdentifier) {
      const existingQRCode = await QRCode.findOne({ customIdentifier });
      if (existingQRCode) {
        res.status(400).json({ message: "Custom identifier already exists" });
        return;
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

export const redirectAndTrackScan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findOne({
      $or: [{ uniqueIdentifier: id }, { customIdentifier: id }],
    });

    if (!qrCode) {
      res.status(404).json({ message: "QR Code not found" });
      return;
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

export const updateQRCodeUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { newUrl } = req.body;
    const userId = req.user?._id;

    if (!newUrl) {
      res.status(400).json({ message: "New URL is required" });
      return;
    }

    const qrCode = await QRCode.findOne({ uniqueIdentifier: id, user: userId });

    if (!qrCode) {
      res.status(404).json({ message: "QR code not found" });
      return;
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

export const getQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const qrCode = await QRCode.findOne({
      uniqueIdentifier: req.params.id,
      user: userId,
    });

    if (!qrCode) {
      res.status(404).json({ message: "QR code not found" });
      return;
    }

    res.json({ success: true, data: qrCode });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error?.message || "Error fetching QR code" });
  }
};

export const listQRCodes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
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

export const deleteQRCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const qrCode = await QRCode.findOneAndDelete({
      uniqueIdentifier: req.params.id,
      user: userId,
    });

    if (!qrCode) {
      res.status(404).json({ message: "QR code not found" });
      return;
    }

    res.json({ success: true, message: "QR code deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error?.message || "Error deleting QR code" });
  }
};

export const trackScan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ipAddress = (
      req.ip ||
      req.connection.remoteAddress ||
      "0.0.0.0"
    ).replace(/^::ffff:/, "");
    const userAgent = req.headers["user-agent"];
    const deviceInfo = userAgent ? parseUserAgent(userAgent) : "unknown";
    const location = await getLocationFromIP(ipAddress);

    const qrCode = await QRCode.findOneAndUpdate(
      { uniqueIdentifier: id },
      {
        $push: {
          scans: {
            timestamp: new Date(),
            ipAddress,
            deviceInfo,
            location,
          },
        },
      },
      { new: true }
    );

    if (!qrCode) {
      res.status(404).json({ message: "QR code not found" });
      return;
    }

    res.redirect(qrCode.currentUrl);
  } catch (error: any) {
    console.error("Scan tracking error:", error);
    const qrCode = await QRCode.findOne({ uniqueIdentifier: req.params.id });
    res.redirect(qrCode ? qrCode.currentUrl : "/");
  }
};

function parseUserAgent(userAgent: string): string {
  const userAgentLower = userAgent.toLowerCase();
  if (
    /iphone|ipad|ipod|android|webos|blackberry|windows phone/i.test(
      userAgentLower
    )
  ) {
    return "Mobile";
  }
  if (/tablet|ipad/i.test(userAgentLower)) {
    return "Tablet";
  }
  if (/windows|macintosh|linux/i.test(userAgentLower)) {
    return "Desktop";
  }
  return "Other";
}
