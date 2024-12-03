// src/pages/QRCodeList/index.tsx
import React from "react";
import { Link } from "react-router-dom";

const QRCodeList: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your QR Codes</h1>
        <Link
          to="/qr/create"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New QR Code
        </Link>
      </div>
      <div>List coming soon...</div>
    </div>
  );
};

export default QRCodeList;
