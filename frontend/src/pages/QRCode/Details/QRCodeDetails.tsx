// /frontend/src/pages/QRCodeDetails.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../utils/axios"
import QRCode from "react-qr-code";
import { ChevronLeft } from "lucide-react";

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
        const response = await axios.get(`/api/qr/${id}`);
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
      await axios.put(`/api/qr/${id}/url`, { newUrl });
      const response = await axios.get(`/api/qr/${id}`);
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
      <div className="mb-6">
        <Link
          to="/"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          <span>Back to QR Codes</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">
          {details.customIdentifier || details.uniqueIdentifier}
        </h1>

        <div className="mb-8 flex flex-col items-center p-6 bg-gray-50 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow">
            <QRCode value={details.currentUrl} size={200} level="H" />
          </div>
          <button
            onClick={() => {
              const svg = document.querySelector("svg");
              if (!svg) {
                console.error("SVG element not found");
                return;
              }

              const svgData = new XMLSerializer().serializeToString(svg);
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");

              if (!ctx) {
                console.error("Canvas context not available");
                return;
              }

              const img = new Image();
              img.onload = () => {
                try {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.fillStyle = "white";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
                  const pngFile = canvas.toDataURL("image/png");
                  const downloadLink = document.createElement("a");
                  downloadLink.download = `qr-code-${details.uniqueIdentifier}.png`;
                  downloadLink.href = pngFile;
                  downloadLink.click();
                } catch (error) {
                  console.error("Error generating QR code image:", error);
                }
              };

              img.onerror = () => {
                console.error("Error loading image");
              };

              img.src =
                "data:image/svg+xml;base64," +
                btoa(unescape(encodeURIComponent(svgData)));
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Download QR Code
          </button>
        </div>

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
