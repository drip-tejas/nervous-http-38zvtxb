// /frontend/src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  PlusCircle, 
  BarChart3, 
  Settings
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isCollapsed: boolean;
}

const NavItem = ({ to, icon, text, isCollapsed }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
      ${isActive 
        ? 'bg-blue-50 text-blue-600' 
        : 'text-gray-600 hover:bg-gray-100'
      }`
    }
  >
    {icon}
    {!isCollapsed && <span>{text}</span>}
  </NavLink>
);

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Main Navigation */}
      <nav className="flex flex-col gap-2 px-3">
        <NavItem
          to="/"
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          isCollapsed={isCollapsed}
        />
        <NavItem
          to="/qr/create"
          icon={<PlusCircle size={20} />}
          text="Create QR Code"
          isCollapsed={isCollapsed}
        />
        <NavItem
          to="/qr/list"
          icon={<QrCode size={20} />}
          text="My QR Codes"
          isCollapsed={isCollapsed}
        />
        <NavItem
          to="/analytics"
          icon={<BarChart3 size={20} />}
          text="Analytics"
          isCollapsed={isCollapsed}
        />
      </nav>

      {/* Bottom Navigation */}
      <nav className="flex flex-col gap-2 px-3 mt-auto">
        <NavItem
          to="/settings"
          icon={<Settings size={20} />}
          text="Settings"
          isCollapsed={isCollapsed}
        />
      </nav>
    </div>
  );
};

export default Sidebar;