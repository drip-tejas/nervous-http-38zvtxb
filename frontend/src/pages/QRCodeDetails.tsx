// /frontend/src/pages/QRCodeDetails.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";

interface QRDetails {
  uniqueIdentifier: string;
  targetUrl: string;
  currentUrl: string;
  customIdentifier?: string;
  createdAt: string;
  urlHistory: Array<{
    url: string;
    changedAt: Date;
  }>;
  scans: Array<{
    timestamp: Date;
    ipAddress?: string;
    deviceInfo?: string;
    location?: {
      country?: string;
      city?: string;
    };
  }>;
}

const QRCodeDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState<QRDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`/qr/${id}`);
        setDetails(response.data.data);
        setNewUrl(response.data.data.currentUrl);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load QR code details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleUrlUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/qr/${id}/url`, { newUrl });
      const response = await axios.get(`/qr/${id}`);
      setDetails(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update URL");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!details) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">
          {details.customIdentifier || details.uniqueIdentifier}
        </h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Update URL</h2>
          <form onSubmit={handleUrlUpdate} className="flex gap-4">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-gray-600">Current URL</p>
            <a
              href={details.currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {details.currentUrl}
            </a>
          </div>
          <div>
            <p className="text-gray-600">Total Scans</p>
            <p className="text-xl font-semibold">{details.scans.length}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">URL History</h2>
        <div className="mb-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Changed At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {details.urlHistory.map((history, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {history.url}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(history.changedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold mb-4">Scan History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {details.scans.map((scan, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(scan.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {scan.ipAddress || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {scan.deviceInfo || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {scan.location?.country
                      ? `${scan.location.city || ""}, ${scan.location.country}`
                      : "Unknown"}
                  </td>
                </tr>
              ))}
              {details.scans.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No scans yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDetails;
