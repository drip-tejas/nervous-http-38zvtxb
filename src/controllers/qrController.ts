import QRCode from "../models/QRCode";
import qrcode from "qrcode";
import { getLocationFromIP } from "../utils/geoLocation";
import { QRAuthHandler } from "../types/qr";

const validateUrl = (url: string): string =>
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;

export const generateQRCode: QRAuthHandler = async (req, res) => {
  try {
    const { targetUrl, customIdentifier } = req.body;
    if (!targetUrl) {
      res
        .status(400)
        .json({ success: false, message: "Target URL is required" });
      return;
    }

    if (customIdentifier) {
      const existing = await QRCode.findOne({ customIdentifier });
      if (existing) {
        res.status(400).json({ success: false, message: "Identifier exists" });
        return;
      }
    }

    const validUrl = validateUrl(targetUrl);
    const redirectUrl = `${process.env.BASE_URL}/api/qr/redirect/${
      customIdentifier || ""
    }`;
    const qrDataUrl = await qrcode.toDataURL(redirectUrl);

    const qrCode = await QRCode.create({
      user: req.user._id,
      targetUrl: validUrl,
      currentUrl: validUrl,
      customIdentifier,
      urlHistory: [{ url: validUrl, changedAt: new Date() }],
    });

    res.status(201).json({
      success: true,
      data: {
        qrCodeUrl: qrDataUrl,
        uniqueIdentifier: qrCode.uniqueIdentifier,
        targetUrl: validUrl,
      },
    });
  } catch (error) {
    console.error("QR Generation Error:", error);

    res
      .status(500)
      .json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to generate QR code",
      });
  }
};

export const redirectAndTrackScan: QRAuthHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findOne({
      $or: [{ uniqueIdentifier: id }, { customIdentifier: id }],
    });

    if (!qrCode) {
      res.status(404).json({ success: false, message: "QR code not found" });
      return;
    }

    qrCode.scans.push({
      timestamp: new Date(),
      ipAddress: req.ip || "",
      deviceInfo: req.get("User-Agent") || "Unknown",
    });

    await qrCode.save();
    res.redirect(qrCode.currentUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: "Redirect failed" });
  }
};

export const updateQRCodeUrl: QRAuthHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { newUrl } = req.body;

    if (!newUrl) {
      res.status(400).json({ success: false, message: "New URL is required" });
      return;
    }

    const qrCode = await QRCode.findOne({
      uniqueIdentifier: id,
      user: req.user._id,
    });

    if (!qrCode) {
      res.status(404).json({ success: false, message: "QR code not found" });
      return;
    }

    const validUrl = validateUrl(newUrl);
    qrCode.urlHistory.push({ url: qrCode.currentUrl, changedAt: new Date() });
    qrCode.currentUrl = validUrl;
    await qrCode.save();

    res.json({
      success: true,
      data: qrCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update URL" });
  }
};

export const getQRCode: QRAuthHandler = async (req, res) => {
  try {
    const qrCode = await QRCode.findOne({
      uniqueIdentifier: req.params.id,
      user: req.user._id,
    });

    if (!qrCode) {
      res.status(404).json({ success: false, message: "QR code not found" });
      return;
    }

    res.json({ success: true, data: qrCode });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch QR code" });
  }
};

export const listQRCodes: QRAuthHandler = async (req, res) => {
  try {
    const qrCodes = await QRCode.find({ user: req.user._id })
      .select(
        "uniqueIdentifier targetUrl currentUrl createdAt scans urlHistory"
      )
      .sort({ createdAt: -1 });

    res.json({ success: true, data: qrCodes });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch QR codes" });
  }
};

export const deleteQRCode: QRAuthHandler = async (req, res) => {
  try {
    const qrCode = await QRCode.findOneAndDelete({
      uniqueIdentifier: req.params.id,
      user: req.user._id,
    });

    if (!qrCode) {
      res.status(404).json({ success: false, message: "QR code not found" });
      return;
    }

    res.json({ success: true, message: "QR code deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete QR code" });
  }
};

export const trackScan: QRAuthHandler = async (req, res) => {
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
      res.status(404).json({ success: false, message: "QR code not found" });
      return;
    }

    res.redirect(qrCode.currentUrl);
  } catch (error) {
    console.error("Scan tracking error:", error);
    const qrCode = await QRCode.findOne({ uniqueIdentifier: req.params.id });
    res.redirect(qrCode ? qrCode.currentUrl : "/");
  }
};

function parseUserAgent(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod|android|webos|blackberry|windows phone/i.test(ua)) {
    return "Mobile";
  }
  if (/tablet|ipad/i.test(ua)) {
    return "Tablet";
  }
  if (/windows|macintosh|linux/i.test(ua)) {
    return "Desktop";
  }
  return "Other";
}
