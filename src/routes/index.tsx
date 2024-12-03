// src/routes/index.tsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom"; // Changed order
import QRCodeGeneration from "../components/QRCodeGeneration";
import QRCodeList from "../pages/QRCodeList";
import QRCodeDetails from "../pages/QRCodeDetails";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QRCodeList />} />
        <Route path="/qr/create" element={<QRCodeGeneration />} />
        <Route path="/qr/:id" element={<QRCodeDetails />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;