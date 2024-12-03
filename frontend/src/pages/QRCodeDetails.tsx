import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface QRDetails {
  id: string;
  title: string;
  url: string;
  scanCount: number;
  createdAt: string;
  scans: {
    timestamp: string;
    ipAddress: string;
    device: string;
  }[];
}

const QRCodeDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState<QRDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/qr/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch QR code details");

        const data = await response.json();
        setDetails(data);
      } catch (err) {
        setError("Failed to load QR code details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!details) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{details.title}</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-gray-600">Destination URL</p>
            <a
              href={details.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {details.url}
            </a>
          </div>
          <div>
            <p className="text-gray-600">Total Scans</p>
            <p className="text-xl font-semibold">{details.scanCount}</p>
          </div>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {details.scans.map((scan, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(scan.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {scan.ipAddress}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {scan.device}
                  </td>
                </tr>
              ))}
              {details.scans.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
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
