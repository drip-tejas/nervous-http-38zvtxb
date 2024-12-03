import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

const QRCodeGeneration = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ title, url }),
      });

      if (!response.ok) throw new Error("Failed to generate QR code");

      const data = await response.json();
      setQrGenerated(true);
      setTimeout(() => navigate(`/qr/${data.id}`), 2000);
    } catch (err) {
      setError("Failed to generate QR code");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Generate QR Code</h2>

      <div className="mb-6">
        {url && (
          <div className="flex justify-center mb-4">
            <QRCode value={url} />
          </div>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={qrGenerated}
        >
          {qrGenerated ? "Generated!" : "Generate QR Code"}
        </button>
      </form>

      {qrGenerated && (
        <div className="mt-4 text-center text-green-600">
          QR Code generated successfully! Redirecting...
        </div>
      )}
    </div>
  );
};

export default QRCodeGeneration;
