import { Home, FileText, User, Settings, Search, Calculator, ChevronDown, LogOut, Plus, Receipt, BarChart3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { getUserAvatarUrl, getUserInitials } from '../../utils/userHelpers';

interface SidebarProps {
  onSettingsClick: () => void;
  onLogout: () => void;
  className?: string;
}

export function Sidebar({
  onSettingsClick,
  onLogout,
  className = "fixed left-0 top-0 h-full bg-black/10 backdrop-blur-xl border-r border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.03)]"
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isTaxesOpen, setIsTaxesOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const avatarUrl = getUserAvatarUrl(currentUser);
  const initials = getUserInitials(currentUser);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <div className={`w-64 flex flex-col ${className}`}>
      {/* Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        className="px-6 py-8 hover:opacity-80 transition-opacity"
      >
        <img src="/logo.svg" alt="Logo" className="h-16" />
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-10">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2.5 bg-transparent text-white placeholder-white/30 rounded-xl transition-colors focus:outline-none focus:bg-white/10"
          />
        </div>
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <button
              onClick={() => navigate('/dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group
                ${currentPath === '/dashboard' ? 'bg-white/20' : ''}`}
            >
              <Home
                size={18}
                className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all"
              />
              <span>Dashboard</span>
            </button>
          </li>

          {/* Receipts */}
          <li>
            <button
              onClick={() => navigate('/dashboard/receipts')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group
                ${currentPath === '/dashboard/receipts' ? 'bg-white/20' : ''}`}
            >
              <Receipt
                size={18}
                className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all"
              />
              <span>Receipts</span>
            </button>
          </li>

          {/* Expenses */}
          <li>
            <button
              onClick={() => navigate('/dashboard/expenses')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group
                ${currentPath === '/dashboard/expenses' ? 'bg-white/20' : ''}`}
            >
              <FileText
                size={18}
                className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all"
              />
              <span>Expenses</span>
            </button>
          </li>

          {/* Reports */}
          <li>
            <button
              onClick={() => navigate('/dashboard/reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group
                ${currentPath === '/dashboard/reports' ? 'bg-white/20' : ''}`}
            >
              <BarChart3
                size={18}
                className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all"
              />
              <span>Reports</span>
            </button>
          </li>

          {/* Prepare Taxes */}
          <li>
            <div>
              <button
                onClick={() => {
                  setIsTaxesOpen(!isTaxesOpen);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group
                  ${currentPath.includes('/dashboard/tax') ? 'bg-white/20' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Calculator
                    size={18}
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

              {isTaxesOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  <button
                    onClick={() => navigate('/dashboard/tax-reports')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-white/90 rounded-lg transition-colors group text-[15px]
                      ${currentPath === '/dashboard/tax-reports'
                        ? 'bg-white/20'
                        : 'bg-white/5 hover:bg-white/15'}`}
                  >
                    <FileText
                      size={18}
                      className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all"
                    />
                    <span>Schedule C</span>
                  </button>
                </div>
              )}
            </div>
          </li>

          {/* Profile */}
          <li>
            <button
              onClick={() => navigate('/dashboard/profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group
                ${currentPath === '/dashboard/profile' ? 'bg-white/20' : ''}`}
            >
              <User
                size={20}
                className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all"
              />
              <span>Profile</span>
            </button>
          </li>

          {/* Settings */}
          <li>
            <button
              onClick={onSettingsClick}
              className={`w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors group
                ${currentPath === '/dashboard/settings' ? 'bg-white/20' : ''}`}
            >
              <Settings
                size={18}
                className="text-transparent bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text stroke-[#00E5FF] group-hover:stroke-[#597FFB] transition-all"
              />
              <span>Settings</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Profile Card */}
      <div className="px-4 pb-8 mt-auto">
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
            title="Profile Menu"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate('/dashboard/profile');
                setIsProfileDropdownOpen(false);
              }}
              className="relative flex-shrink-0 hover:opacity-80 transition-opacity rounded-full cursor-pointer"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-12 w-12 rounded-full object-cover ring-2"
                  style={{ '--tw-ring-color': 'rgb(6 229 255 / 43%)' } as React.CSSProperties}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-white/10 ring-2 flex items-center justify-center" style={{ '--tw-ring-color': 'rgb(6 229 255 / 43%)' } as React.CSSProperties}>
                  <span className="text-white/90 text-sm font-medium">{initials}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{currentUser?.user_metadata?.full_name || 'User'}</p>
              <p className="hidden sm:block text-xs text-white/60 truncate">{currentUser?.email}</p>
            </div>

            <Plus size={18} className="flex-shrink-0 text-white/60" />
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden shadow-lg">
              <button
                onClick={() => {
                  onLogout();
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 transition-colors text-left"
              >
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
