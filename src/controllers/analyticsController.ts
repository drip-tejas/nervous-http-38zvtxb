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
    const daysActive = Math.max(
      1,
      Math.ceil(
        (now.getTime() - new Date(qrCode.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    // Format daily stats as array
    const dailyStatsObj = qrCode.scans.reduce(
      (acc: { [key: string]: number }, scan) => {
        const date = new Date(scan.timestamp).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );
    const dailyStats = Object.entries(dailyStatsObj)
      .map(([date, scans]) => ({ date, scans }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Format hourly distribution as array
    const hourlyDistObj = qrCode.scans.reduce(
      (acc: { [key: string]: number }, scan) => {
        const hour = new Date(scan.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      },
      {}
    );
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      scans: hourlyDistObj[hour] || 0,
    }));

    // Format device breakdown as array
    const deviceObj = qrCode.scans.reduce(
      (acc: { [key: string]: number }, scan) => {
        const device = scan.deviceInfo || "unknown";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      {}
    );
    const deviceStats = Object.entries(deviceObj).map(([name, value]) => ({
      name,
      value,
    }));

    const analytics = {
      totalScans: qrCode.scans.length,
      uniqueVisitors: uniqueIPs.size,
      daysActive,
      scansPerDay: (qrCode.scans.length / daysActive).toFixed(2),
      lastScan:
        qrCode.scans.length > 0
          ? qrCode.scans[qrCode.scans.length - 1].timestamp
          : null,
      deviceStats,
      hourlyStats,
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
      { $project: { scanCount: { $size: "$scans" } } },
      { $group: { _id: null, total: { $sum: "$scanCount" } } },
    ]);

    const uniqueVisitors = await QRCode.aggregate([
      { $unwind: "$scans" },
      { $group: { _id: "$scans.ipAddress" } },
      { $count: "total" },
    ]);

    const deviceStats = await QRCode.aggregate([
      { $unwind: "$scans" },
      {
        $group: {
          _id: "$scans.deviceInfo",
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
    ]);

    res.json({
      totalScans: totalScans[0]?.total || 0,
      uniqueVisitors: uniqueVisitors[0]?.total || 0,
      dailyStats: await QRCode.aggregate([
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
      ]),
      hourlyStats: await QRCode.aggregate([
        { $unwind: "$scans" },
        {
          $group: {
            _id: { $hour: "$scans.timestamp" },
            scans: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { hour: "$_id", scans: 1, _id: 0 } },
      ]),
      deviceStats,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
