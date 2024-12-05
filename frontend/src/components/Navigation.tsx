// /frontend/src/components/Navigation.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Navigation: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment);

  return (
    <nav className="bg-white border-b p-4 mb-6">
      <div className="max-w-7xl mx-auto flex items-center space-x-2 text-sm">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          <Home size={18} className="inline-block" />
        </Link>

        {pathSegments.map((segment, index) => (
          <React.Fragment key={index}>
            <ChevronRight size={16} className="text-gray-400" />
            <Link
              to={`/${pathSegments.slice(0, index + 1).join("/")}`}
              className="text-gray-600 hover:text-gray-900 capitalize"
            >
              {segment === "qr" ? "QR Codes" : segment}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
