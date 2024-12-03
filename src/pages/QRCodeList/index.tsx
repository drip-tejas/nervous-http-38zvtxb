// src/pages/QRCodeList/index.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Scan,
  Calendar,
  RefreshCw,
  ArrowUpDown,
  Users,
  TrendingUp,
  Clock,
  QrCode,
  ChevronDown,
} from "lucide-react";

interface QRCode {
  uniqueIdentifier: string;
  targetUrl: string;
  createdAt: string;
  scans: Array<{
    timestamp: string;
    deviceInfo: string;
    ipAddress: string;
  }>;
}

interface DateRange {
  start: Date;
  end: Date;
}

type SortField = "date" | "scans";
type SortOrder = "asc" | "desc";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
}

const predefinedRanges = {
  "Last 7 Days": {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
  "Last 30 Days": {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
  "This Month": {
    start: new Date(new Date().setDate(1)),
    end: new Date(),
  },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend }) => (
  <div className="bg-white rounded-lg p-4 shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {trend && (
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp
              className={`w-4 h-4 mr-1 ${
                trend.value > 0 ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={trend.value > 0 ? "text-green-600" : "text-red-600"}
            >
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </div>
      <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
    </div>
  </div>
);

const QRCodeList: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateRange, setDateRange] = useState<DateRange>(
    predefinedRanges["Last 7 Days"]
  );
  const [showRangeSelector, setShowRangeSelector] = useState(false);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/qr/list");
      const data = await response.json();
      setQrCodes(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch QR codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const calculateStats = (codes: QRCode[]) => {
    const totalQRCodes = codes.length;

    const filteredScans = codes.reduce((sum, code) => {
      return (
        sum +
        code.scans.filter((scan) => {
          const scanDate = new Date(scan.timestamp);
          return scanDate >= dateRange.start && scanDate <= dateRange.end;
        }).length
      );
    }, 0);

    const previousPeriodStart = new Date(
      dateRange.start.getTime() -
        (dateRange.end.getTime() - dateRange.start.getTime())
    );

    const previousScans = codes.reduce((sum, code) => {
      return (
        sum +
        code.scans.filter((scan) => {
          const scanDate = new Date(scan.timestamp);
          return scanDate >= previousPeriodStart && scanDate < dateRange.start;
        }).length
      );
    }, 0);

    const scanGrowth =
      previousScans === 0
        ? 100
        : Math.round(((filteredScans - previousScans) / previousScans) * 100);

    return {
      totalQRCodes,
      totalScans: filteredScans,
      scanGrowth,
    };
  };

  const stats = calculateStats(qrCodes);

  const sortQRCodes = (codes: QRCode[]) => {
    return [...codes].sort((a, b) => {
      if (sortField === "date") {
        return sortOrder === "desc"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return sortOrder === "desc"
          ? b.scans.length - a.scans.length
          : a.scans.length - b.scans.length;
      }
    });
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleRangeSelect = (range: DateRange) => {
    setDateRange(range);
    setShowRangeSelector(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const sortedQRCodes = sortQRCodes(qrCodes);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your QR Codes</h1>
        <div className="space-x-4">
          <div className="relative inline-block">
            <button
              onClick={() => setShowRangeSelector(!showRangeSelector)}
              className="inline-flex items-center px-3 py-2 border rounded-md hover:bg-gray-50"
            >
              {dateRange.start.toLocaleDateString()} -{" "}
              {dateRange.end.toLocaleDateString()}
              <ChevronDown className="ml-2 w-4 h-4" />
            </button>
            {showRangeSelector && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                {Object.entries(predefinedRanges).map(([label, range]) => (
                  <button
                    key={label}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleRangeSelect(range)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => fetchQRCodes()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/qr/create"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New QR Code
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total QR Codes"
          value={stats.totalQRCodes}
          icon={<QrCode className="w-6 h-6 text-blue-500" />}
        />
        <StatsCard
          title="Total Scans"
          value={stats.totalScans}
          icon={<Scan className="w-6 h-6 text-green-500" />}
          trend={{
            value: stats.scanGrowth,
            label: "vs previous period",
          }}
        />
        <StatsCard
          title="Average Scans"
          value={
            stats.totalQRCodes
              ? Math.round(stats.totalScans / stats.totalQRCodes)
              : 0
          }
          icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => handleSort("date")}
          className={`inline-flex items-center px-3 py-2 rounded ${
            sortField === "date" ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Date
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </button>
        <button
          onClick={() => handleSort("scans")}
          className={`inline-flex items-center px-3 py-2 rounded ${
            sortField === "scans" ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          <Scan className="w-4 h-4 mr-2" />
          Scans
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid gap-4">
        {sortedQRCodes.map((qrCode) => (
          <Link
            key={qrCode.uniqueIdentifier}
            to={`/qr/${qrCode.uniqueIdentifier}`}
            className="block transition-all hover:transform hover:-translate-y-1"
          >
            <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-medium mb-2 truncate max-w-xl">
                    {qrCode.targetUrl}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(qrCode.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Scan className="w-4 h-4 mr-2" />
                      {qrCode.scans.length} scans
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {qrCode.uniqueIdentifier}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sortedQRCodes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No QR codes yet. Create your first one!
        </div>
      )}
    </div>
  );
};

export default QRCodeList;
