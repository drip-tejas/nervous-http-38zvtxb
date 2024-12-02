import React, { useState } from 'react';
import axios from 'axios';

const QRCodeGeneration = () => {
  const [formData, setFormData] = useState({ targetUrl: '', customIdentifier: '' });
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/qr/generate', formData);
      setQrCodeUrl(response.data.qrCodeUrl);
      setError('');
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
    <div>
      <h2>Generate QR Code</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Target URL:
          <input type="text" name="targetUrl" value={formData.targetUrl} onChange={handleInputChange} />
        </label>
        <label>
          Custom Identifier (optional):
          <input type="text" name="customIdentifier" value={formData.customIdentifier} onChange={handleInputChange} />
        </label>
        <button type="submit">Generate QR Code</button>
      </form>
      {error && <div>{error}</div>}
      {qrCodeUrl && (
        <div>
          <img src={qrCodeUrl} alt="QR Code" />
          <a href={qrCodeUrl} download>Download QR Code</a>
        </div>
      )}
    </div>
  );
};

export default QRCodeGeneration;