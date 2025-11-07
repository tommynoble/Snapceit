import { Settings, LineChart, Calculator, CircleDollarSign, LogOut, Home, User, FileText, Percent, ChevronDown, ChevronRight, Layout } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

interface SidebarProps {
  onSpendingHabitsClick: () => void;
  onPriceMatchClick: () => void;
  onTaxPageClick: () => void;
  onSettingsClick: () => void;
  onDeductionsClick: () => void;
  onLogout: () => void;
}

export function Sidebar({
  onSpendingHabitsClick,
  onPriceMatchClick,
  onTaxPageClick,
  onSettingsClick,
  onDeductionsClick,
  onLogout
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isTaxesOpen, setIsTaxesOpen] = useState(false);

  // Memoize navItems to prevent re-renders
  const navItems = useMemo(() => [
    { icon: Home, label: 'Dashboard', onClick: () => navigate('/dashboard'), path: '/dashboard' },
    { icon: FileText, label: 'Expenses', onClick: () => navigate('/dashboard/files'), path: '/dashboard/files' },
    { icon: CircleDollarSign, label: 'Price Match', onClick: onPriceMatchClick, path: '/dashboard/price-match' },
    { icon: Layout, label: 'Template Preview', onClick: () => navigate('/dashboard/template-preview'), path: '/dashboard/template-preview' },
    { icon: User, label: 'Profile', onClick: () => navigate('/dashboard/profile'), path: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', onClick: onSettingsClick, path: '/dashboard/settings' },
  ], [navigate, onPriceMatchClick, onSettingsClick]);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-black/10 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-[0_0_8px_rgba(255,255,255,0.03)]">
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

          {/* Prepare Taxes with Dropdown */}
          <li>
            <div>
              <button
                onClick={() => {
                  setIsTaxesOpen(!isTaxesOpen);
                  navigate('/dashboard/tax-calculator');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group
                  ${currentPath.includes('/dashboard/tax') ? 'bg-white/20' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Calculator 
                    size={20} 
                    className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all" 
                  />
                  <span>Prepare Taxes</span>
                </div>
                {isTaxesOpen ? (
                  <ChevronDown size={18} className="text-white/60 transform rotate-180 transition-transform" />
                ) : (
                  <ChevronDown size={18} className="text-white/60 transition-transform" />
                )}
              </button>
              
              {/* Dropdown Content */}
              {isTaxesOpen && (
                <div className="ml-6 mt-1">
                  <button
                    onClick={onDeductionsClick}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-white/90 rounded-lg transition-colors group text-[15px]
                      ${currentPath === '/dashboard/deductions' 
                        ? 'bg-white/20' 
                        : 'bg-white/5 hover:bg-white/15'}`}
                  >
                    <Percent 
                      size={18} 
                      className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all" 
                    />
                    <span>Deductions</span>
                  </button>
                </div>
              )}
            </div>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="px-4 pb-8">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group"
        >
          <LogOut size={20} className="text-red-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
