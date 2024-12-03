// src/pages/QRCodeList/index.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface QRCode {
  uniqueIdentifier: string;
  targetUrl: string;
  createdAt: string;
  scans: Array<any>; // We'll use scan count for now
}

const QRCodeList: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch("/api/qr/list");
      const data = await response.json();
      setQrCodes(data);
    } catch (err) {
      setError("Failed to fetch QR codes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your QR Codes</h1>
        <Link
          to="/qr/create"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Create New QR Code
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {qrCodes.map((qrCode) => (
          <Link
            key={qrCode.uniqueIdentifier}
            to={`/qr/${qrCode.uniqueIdentifier}`}
            className="block"
          >
            <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="truncate text-lg font-medium mb-2">
                {qrCode.targetUrl}
              </div>
              <div className="text-sm text-gray-600">
                <div>
                  Created: {new Date(qrCode.createdAt).toLocaleDateString()}
                </div>
                <div>Total Scans: {qrCode.scans.length}</div>
                <div className="text-xs mt-2 text-gray-500">
                  ID: {qrCode.uniqueIdentifier}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {qrCodes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No QR codes yet. Create your first one!
        </div>
      )}
    </div>
  );
};

export default QRCodeList;
