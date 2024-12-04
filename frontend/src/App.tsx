import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import QRCodeGeneration from "./components/QRCodeGeneration";
import QRCodeList from "./pages/QRCodeList";
import QRCodeDetails from "./pages/QRCodeDetails";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <QRCodeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qr/create"
            element={
              <ProtectedRoute>
                <QRCodeGeneration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qr/:id"
            element={
              <ProtectedRoute>
                <QRCodeDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
