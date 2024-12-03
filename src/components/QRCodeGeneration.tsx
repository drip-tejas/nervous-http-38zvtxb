// src/components/QRCodeGeneration.tsx
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { AlertCircle, Link as LinkIcon } from 'lucide-react';

interface FormData {
  targetUrl: string;
  customIdentifier: string;
}

interface GenerateResponse {
  qrCode: string;
  uniqueIdentifier: string;
}

const QRCodeGeneration: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    targetUrl: '',
    customIdentifier: ''
  });
  const [qrCodeData, setQrCodeData] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.targetUrl) {
        throw new Error('Target URL is required');
      }

      const response = await axios.post<GenerateResponse>('/api/qr/generate', formData);
      setQrCodeData(response.data);
    } catch (err) {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Generate QR Code</h2>
        <p className="text-gray-600">Create a custom QR code for your URL</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Target URL
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleInputChange}
                placeholder="Enter your URL (e.g., example.com)"
                className="pl-10 w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Custom Identifier (optional)
            </label>
            <input
              type="text"
              name="customIdentifier"
              value={formData.customIdentifier}
              onChange={handleInputChange}
              placeholder="Enter custom identifier"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      </form>

      {qrCodeData && (
        <div className="mt-8 p-6 border rounded-md bg-gray-50">
          <div className="text-center">
            <img 
              src={qrCodeData.qrCode} 
              alt="QR Code" 
              className="mx-auto mb-4"
            />
            <p className="text-sm text-gray-600 mb-4">
              Identifier: {qrCodeData.uniqueIdentifier}
            </p>
            <div className="space-x-4">
              
                href={qrCodeData.qrCode}
                download={`qr-${qrCodeData.uniqueIdentifier}.png`}
                className="inline-block py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Download QR Code
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(formData.targetUrl)}
                className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGeneration;