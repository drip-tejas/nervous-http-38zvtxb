import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginForm, RegisterForm } from "../components/auth";
import QRCodeGeneration from "../components/QRCodeGeneration";
import QRCodeList from "../pages/QRCodeList";
import QRCodeDetails from "../pages/QRCodeDetails";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={
          <ProtectedRoute>
            <QRCodeList />
          </ProtectedRoute>
        } />
        <Route path="/qr/create" element={
          <ProtectedRoute>
            <QRCodeGeneration />
          </ProtectedRoute>
        } />
        <Route path="/qr/:id" element={
          <ProtectedRoute>
            <QRCodeDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;