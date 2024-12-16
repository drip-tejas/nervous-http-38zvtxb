// /frontend/src/components/QRCodeGeneration.tsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { Download } from "lucide-react";
import axios from "../utils/axios";
import toast from "react-hot-toast"
import { downloadQRCode } from "../utils/qrCodeUtils";

interface QRCodeGenerationProps {
  onSuccess?: (identifier: string) => void;
}


const QRCodeGeneration = ({ onSuccess }: QRCodeGenerationProps) => {
  const [url, setUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [qrData, setQrData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const qrRef = useRef<HTMLDivElement>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };


  const handleDownload = async () => {
    const svg = qrRef.current?.querySelector("svg");
    try {
      await downloadQRCode(svg, `qr-code-${customId || "download"}`);
      toast.success("QR Code downloaded successfully!");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code");
    }
  };  

    

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/qr/generate", {
        targetUrl: url,
        customIdentifier: customId || undefined,
      });

      const { qrCodeUrl, uniqueIdentifier } = response.data.data;
      setQrData(qrCodeUrl);
      toast.success("QR Code generated successfully!");

      onSuccess?.(uniqueIdentifier);
      setTimeout(() => navigate(`/qr/${uniqueIdentifier}`), 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to generate QR code";
      toast.error(errorMessage);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Generate QR Code</h2>

      <div className="mb-6">
        {qrData && (
          <div className="flex flex-col items-center gap-4">
            <div
              ref={qrRef}
              className="flex justify-center mb-4 bg-white p-4 rounded-lg"
            >
              <QRCode value={qrData} size={256} />
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download QR Code</span>
            </button>
          </div>
        )}
      </div>

      {/* {error && <div className="text-red-500 mb-4">{error}</div>} */}

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
