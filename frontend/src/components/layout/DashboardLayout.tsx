// /frontend/src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';
import QRCodeList from '../../pages/QRCode/List';
import QRCodeGeneration from '../QRCodeGeneration';
import QRCodeDetails from '../../pages/QRCode/Details/QRCodeDetails';
import AnalyticsDashboard from '../../pages/Analytics';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  console.log("in dashboard")

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (

    <div className="flex h-screen bg-gray-50">
      <aside
        className={`
          ${sidebarOpen ? 'w-72' : 'w-20'} 
          transition-all duration-300 ease-in-out
          bg-white border-r border-gray-200 
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen && (
            <span className="text-xl font-semibold text-gray-800">DripQR</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu size={20} />
          </button>
        </div>

        <Sidebar isCollapsed={!sidebarOpen} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName={user?.name || 'User'}
          userEmail={user?.email || ''}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* <Outlet /> */}
          <Routes>
            {/* Dashboard */}
            <Route path="" element={<QRCodeList />} />

            {/* QR Code routes */}
            <Route path="qr/create" element={<QRCodeGeneration />} />
            <Route path="qr/:id" element={<QRCodeDetails />} />

            {/* Analytics */}
            <Route path="analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;