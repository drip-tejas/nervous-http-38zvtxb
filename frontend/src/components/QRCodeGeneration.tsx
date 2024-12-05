// /frontend/src/components/QRCodeGeneration.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import axios from "../utils/axios";

const QRCodeGeneration = () => {
  const [url, setUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [qrData, setQrData] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Making API request to:", "/qr/generate"); // Debug log

      const response = await axios.post("/qr/generate", {
        targetUrl: url,
        customIdentifier: customId || undefined,
      });

      console.log("API Response:", response.data); // Debug log

      setQrData(response.data.data.qrCodeUrl);
      setTimeout(
        () => navigate(`/qr/${response.data.data.uniqueIdentifier}`),
        2000
      );
    } catch (err: any) {
      console.error("API Error:", err); // Debug log

      setError(err.response?.data?.message || "Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Generate QR Code</h2>

      <div className="mb-6">
        {qrData && (
          <div className="flex justify-center mb-4">
            <img src={qrData} alt="Generated QR Code" />
          </div>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Destination URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Custom Identifier (Optional)
          </label>
          <input
            type="text"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="my-custom-id"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate QR Code"}
        </button>
      </form>

      {qrData && (
        <div className="mt-4 text-center text-green-600">
          QR Code generated successfully! Redirecting...
        </div>
      )}
    </div>
  );
};

export default QRCodeGeneration;
