// /frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import QRCodeGeneration from "./components/QRCodeGeneration";
import QRCodeList from "./pages/QRCodeList";
import QRCodeDetails from "./pages/QRCodeDetails";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import DashboardLayout from "./components/layout/DashboardLayout";

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected routes with dashboard layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Dashboard */}
              <Route path="/" element={<QRCodeList />} />

              {/* QR Code routes */}
              <Route path="/qr/create" element={<QRCodeGeneration />} />
              <Route path="/qr/:id" element={<QRCodeDetails />} />

              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Route>
          </Route>
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#059669',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#DC2626',
              },
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;