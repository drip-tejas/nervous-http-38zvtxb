import { Request, Response } from "express";
import QRCode from "../models/QRCode";

// Individual QR code analytics
export const getQRCodeAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findOne({ uniqueIdentifier: id });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    const uniqueIPs = new Set(qrCode.scans.map((scan) => scan.ipAddress));
    const now = new Date();
    const daysActive = Math.floor(
      (now.getTime() - new Date(qrCode.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const dailyStats = qrCode.scans.reduce(
      (acc: { [key: string]: number }, scan) => {
        const date = new Date(scan.timestamp).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    const analytics = {
      totalScans: qrCode.scans.length,
      uniqueVisitors: uniqueIPs.size,
      daysActive,
      scansPerDay: daysActive
        ? (qrCode.scans.length / daysActive).toFixed(2)
        : qrCode.scans.length,
      lastScan: qrCode.scans[qrCode.scans.length - 1]?.timestamp || null,
      deviceBreakdown: qrCode.scans.reduce(
        (acc: { [key: string]: number }, scan) => {
          const device = scan.deviceInfo || "unknown";
          acc[device] = (acc[device] || 0) + 1;
          return acc;
        },
        {}
      ),
      hourlyDistribution: qrCode.scans.reduce(
        (acc: { [key: string]: number }, scan) => {
          const hour = new Date(scan.timestamp).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        },
        {}
      ),
      dailyStats,
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
};

// Global analytics across all QR codes
export const getGlobalAnalytics = async (req: Request, res: Response) => {
  try {
    const totalScans = await QRCode.aggregate([
      { $group: { _id: null, total: { $sum: "$scanCount" } } },
    ]);

    const uniqueVisitors = await QRCode.aggregate([
      { $unwind: "$scans" },
      { $group: { _id: "$scans.visitorId" } },
      { $count: "total" },
    ]);

    const dailyStats = await QRCode.aggregate([
      { $unwind: "$scans" },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$scans.timestamp" },
          },
          scans: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", scans: 1, _id: 0 } },
    ]);

    const hourlyStats = await QRCode.aggregate([
      { $unwind: "$scans" },
      {
        $group: {
          _id: { $hour: "$scans.timestamp" },
          scans: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { hour: "$_id", scans: 1, _id: 0 } },
    ]);

    const deviceStats = await QRCode.aggregate([
      { $unwind: "$scans" },
      {
        $group: {
          _id: "$scans.deviceType",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalScans: totalScans[0]?.total || 0,
      uniqueVisitors: uniqueVisitors[0]?.total || 0,
      dailyStats,
      hourlyStats,
      deviceStats,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};