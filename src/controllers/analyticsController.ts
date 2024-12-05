/*
import { Response } from "express";
import QRCode from "../models/QRCode";
import { RequestWithAuth } from "../types/express";

interface DailyStats {
  date: string;
  scans: number;
}

interface HourlyStats {
  hour: string;
  scans: number;
}

interface DeviceStats {
  name: string;
  count: number;
}

export const getQRCodeAnalytics = async (
  req: RequestWithAuth,
  res: Response
) => {
  try {
    const qrCode = await QRCode.findOne({
      uniqueIdentifier: req.params.id,
      user: req.user._id,
    });

    if (!qrCode) {
      res.status(404).json({ success: false, message: "QR code not found" });
      return;
    }

    const uniqueIPs = new Set(qrCode.scans.map((scan) => scan.ipAddress));
    const daysActive = Math.max(
      1,
      Math.ceil(
        (Date.now() - qrCode.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    // Process daily stats
    const dailyStatsObj = qrCode.scans.reduce((acc, scan) => {
      const date = new Date(scan.timestamp).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyStats = Object.entries(dailyStatsObj)
      .map(([date, scans]) => ({ date, scans }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process hourly stats
    const hourlyDistObj = qrCode.scans.reduce((acc, scan) => {
      const hour = new Date(scan.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      scans: hourlyDistObj[hour] || 0,
    }));

    // Process device stats
    const deviceObj = qrCode.scans.reduce((acc, scan) => {
      const device = scan.deviceInfo || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deviceStats = Object.entries(deviceObj).map(([name, count]) => ({
      name,
      count,
    }));

    res.json({
      success: true,
      data: {
        totalScans: qrCode.scans.length,
        uniqueVisitors: uniqueIPs.size,
        daysActive,
        scansPerDay: (qrCode.scans.length / daysActive).toFixed(2),
        lastScan: qrCode.scans[qrCode.scans.length - 1]?.timestamp || null,
        dailyStats,
        hourlyStats,
        deviceStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch analytics",
    });
  }
};

export const getGlobalAnalytics = async (
  _req: RequestWithAuth,
  res: Response
) => {
  try {
    const [totalScansResult] = await QRCode.aggregate([
      { $project: { scanCount: { $size: "$scans" } } },
      { $group: { _id: null, total: { $sum: "$scanCount" } } },
    ]);

    const [uniqueVisitorsResult] = await QRCode.aggregate([
      { $unwind: "$scans" },
      { $group: { _id: "$scans.ipAddress" } },
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
          _id: "$scans.deviceInfo",
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
    ]);

    res.json({
      success: true,
      data: {
        totalScans: totalScansResult?.total || 0,
        uniqueVisitors: uniqueVisitorsResult?.total || 0,
        dailyStats,
        hourlyStats,
        deviceStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch analytics",
    });
  }
};
*/

import { Response } from "express";
import QRCode from "../models/QRCode";
/* import { AuthenticatedRequest, QRController } from '../types/qr'; */
import { QRAuthHandler } from '../types/qr';

export const getQRCodeAnalytics: QRAuthHandler = async (
  req,
  res
) => {
  try {
    const qrCode = await QRCode.findOne({
      uniqueIdentifier: req.params.id,
      user: req.user._id,
    });

    if (!qrCode) {
      res.status(404).json({ success: false, message: "QR code not found" });
      return;
    }

    const uniqueIPs = new Set(qrCode.scans.map((scan) => scan.ipAddress));
    const daysActive = Math.max(
      1,
      Math.ceil(
        (Date.now() - qrCode.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

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

    const hourlyDistObj = qrCode.scans.reduce(
      (acc: { [key: number]: number }, scan) => {
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

    const deviceObj = qrCode.scans.reduce(
      (acc: { [key: string]: number }, scan) => {
        const device = scan.deviceInfo || "unknown";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      {}
    );

    const deviceStats = Object.entries(deviceObj).map(([name, count]) => ({
      name,
      count,
    }));

    res.json({
      success: true,
      data: {
        totalScans: qrCode.scans.length,
        uniqueVisitors: uniqueIPs.size,
        daysActive,
        scansPerDay: (qrCode.scans.length / daysActive).toFixed(2),
        lastScan: qrCode.scans[qrCode.scans.length - 1]?.timestamp || null,
        dailyStats,
        hourlyStats,
        deviceStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch analytics",
    });
  }
};

export const getGlobalAnalytics: QRAuthHandler = async (
  _req, res
) => {
  try {
    const [totalScansResult] = await QRCode.aggregate([
      { $project: { scanCount: { $size: "$scans" } } },
      { $group: { _id: null, total: { $sum: "$scanCount" } } },
    ]);

    const [uniqueVisitorsResult] = await QRCode.aggregate([
      { $unwind: "$scans" },
      { $group: { _id: "$scans.ipAddress" } },
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
          _id: "$scans.deviceInfo",
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
    ]);

    res.json({
      success: true,
      data: {
        totalScans: totalScansResult?.total || 0,
        uniqueVisitors: uniqueVisitorsResult?.total || 0,
        dailyStats,
        hourlyStats,
        deviceStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch analytics",
    });
  }
};
