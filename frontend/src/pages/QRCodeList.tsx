import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface QRCode {
  id: string;
  title: string;
  url: string;
  scanCount: number;
  createdAt: string;
}

const QRCodeList = () => {
  const [codes, setCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/qr/list", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch QR codes");

        const data = await response.json();
        setCodes(data);
      } catch (err) {
        setError("Failed to load QR codes");
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your QR Codes</h1>
        <Link
          to="/qr/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Scans
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {codes.map((code) => (
              <tr key={code.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    to={`/qr/${code.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {code.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{code.url}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {code.scanCount}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(code.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No QR codes yet. Create your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QRCodeList;
