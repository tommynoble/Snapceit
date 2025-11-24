import { Search, Bell, HelpCircle, Sun, X, User, Settings, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { getUserDisplayName, getUserInitials, getUserAvatarUrl } from '../../utils/userHelpers';

interface DashboardNavbarProps {
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export const DashboardNavbar = ({ onProfileClick, onSettingsClick, onLogout }: DashboardNavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
  };

  const handleAvatarClick = () => {
    if (isMobile) {
      onProfileClick();
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const displayName = getUserDisplayName(currentUser);
  const initials = getUserInitials(currentUser);
  const avatarUrl = getUserAvatarUrl(currentUser);

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-4 px-6 py-1.5 border-b border-white/10">
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button 
              onClick={toggleSearch}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Search className="h-4 w-4 text-white/70" />
            </button>
            
            <AnimatePresence>
              {isSearchOpen && !isMobile && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "calc(100vw - 800px)", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute right-0 top-0 origin-right max-w-[500px]"
                >
                  <div className="relative">
                    <button
                      onClick={toggleSearch}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-full transition-colors"
                    >
                      <Search className="h-4 w-4 text-white/50 hover:text-white/70 transition-colors" />
                    </button>
                    <input
                      type="text"
                      placeholder="Search..."
                      autoFocus
                      className="w-full h-9 bg-white/5 border border-white/10 rounded-full pr-4 pl-10 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#4FDDE6]/50"
                      onBlur={(e) => {
                        const searchButton = e.currentTarget.parentElement?.querySelector('button');
                        if (!searchButton?.contains(e.relatedTarget as Node)) {
                          setIsSearchOpen(false);
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <HelpCircle className="h-4 w-4 text-white/70" />
          </button>
          
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
            <Bell className="h-4 w-4 text-white/70" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#4FDDE6] rounded-full"></span>
          </button>
          
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Sun className="h-4 w-4 text-white/70" />
          </button>
          
          <div className="relative pr-8">
            <button 
              onClick={handleAvatarClick}
              className="relative p-1.5 rounded-full transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4FDDE6]/50"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-white/20"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
                  <span className="text-white/90 text-sm font-medium">{initials}</span>
                </div>
              )}
            </button>

            <AnimatePresence>
              {isDropdownOpen && !isMobile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white/10 backdrop-blur-xl shadow-lg ring-1 ring-white/20 focus:outline-none z-50"
                >
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-white/70" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {displayName}
                        </p>
                        <p className="text-xs text-white/70">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onProfileClick();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSettingsClick();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <div className="my-1 border-t border-white/10" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={toggleSearch}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 z-50"
            >
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search..."
                  autoFocus
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 focus:outline-none text-base"
                />
                <button 
                  onClick={toggleSearch}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
