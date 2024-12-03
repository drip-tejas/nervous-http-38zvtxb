// src/components/QRAnalytics.tsx

import React, { useState, useEffect, ReactNode } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, Users, Scan, Activity } from "lucide-react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
    {children}
  </div>
);

interface Analytics {
  totalScans: number;
  uniqueVisitors: number;
  daysActive: number;
  scansPerDay: string;
  lastScan: string | null;
  deviceStats: Array<{ name: string; value: number }>;
  hourlyStats: Array<{ hour: string; scans: number }>;
  dailyStats: Array<{ date: string; scans: number }>;
}

interface Props {
  id: string;
}

const QRAnalytics: React.FC<Props> = ({ id }) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981"];

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/${id}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!analytics) return <div className="p-6">No analytics data available</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Scan className="h-6 w-6 text-blue-500" />
            <h3 className="font-semibold">Total Scans</h3>
          </div>
          <div className="text-2xl font-bold">{analytics.totalScans}</div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-green-500" />
            <h3 className="font-semibold">Unique Visitors</h3>
          </div>
          <div className="text-2xl font-bold">{analytics.uniqueVisitors}</div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-6 w-6 text-purple-500" />
            <h3 className="font-semibold">Days Active</h3>
          </div>
          <div className="text-2xl font-bold">{analytics.daysActive}</div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-6 w-6 text-orange-500" />
            <h3 className="font-semibold">Scans/Day</h3>
          </div>
          <div className="text-2xl font-bold">{analytics.scansPerDay}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Daily Scans</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Device Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.deviceStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analytics.deviceStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <h3 className="font-semibold mb-4">Hourly Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hourlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QRAnalytics;
