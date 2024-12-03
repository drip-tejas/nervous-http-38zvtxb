// src/pages/QRCodeDetails/index.tsx
import React from "react";
import { useParams } from "react-router-dom";
import QRAnalytics from "../../components/QRAnalytics";

const QRCodeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Invalid QR Code ID</div>;

  return (
    <div className="p-6">
      <QRAnalytics id={id} />
    </div>
  );
};

export default QRCodeDetails;