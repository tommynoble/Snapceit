import { Settings, LineChart, Calculator, CircleDollarSign, LogOut, Home, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

interface SidebarProps {
  onSpendingHabitsClick: () => void;
  onPriceMatchClick: () => void;
  onTaxPageClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export function Sidebar({
  onSpendingHabitsClick,
  onPriceMatchClick,
  onTaxPageClick,
  onSettingsClick,
  onLogout
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Memoize navItems to prevent re-renders
  const navItems = useMemo(() => [
    { icon: User, label: 'Profile', onClick: () => {}, path: '/dashboard/profile' },
    { icon: Home, label: 'Dashboard', onClick: () => navigate('/dashboard'), path: '/dashboard' },
    { icon: LineChart, label: 'Spending Habits', onClick: onSpendingHabitsClick, path: '/dashboard/spending-habits' },
    { icon: CircleDollarSign, label: 'Price Match', onClick: onPriceMatchClick, path: '/dashboard/price-match' },
    { icon: Calculator, label: 'Tax Calculator', onClick: onTaxPageClick, path: '/dashboard/tax-calculator' },
    { icon: Settings, label: 'Settings', onClick: onSettingsClick, path: '/dashboard/settings' },
  ], [navigate, onSpendingHabitsClick, onPriceMatchClick, onTaxPageClick, onSettingsClick]);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-black/10 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8">
        <img src="/images/logo.svg" alt="Logo" className="h-16" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-10">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={item.label} className={index === 0 ? 'mt-1' : ''}>
              <button
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group
                  ${currentPath === item.path ? 'bg-white/20' : ''}`}
              >
                <item.icon 
                  size={20} 
                  className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all" 
                />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="px-4 pb-8">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group"
        >
          <LogOut 
            size={20} 
            className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all" 
          />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
