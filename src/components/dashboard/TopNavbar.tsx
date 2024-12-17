import { Search, Bell, HelpCircle, Sun, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TopNavbarProps {
  onProfileClick: () => void;
}

export const TopNavbar = ({ onProfileClick }: TopNavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-4 px-6 -mt-2">
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button 
              onClick={toggleSearch}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Search className="h-[18px] w-[18px] text-white/70" />
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
            <HelpCircle className="h-[18px] w-[18px] text-white/70" />
          </button>
          
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
            <Bell className="h-[18px] w-[18px] text-white/70" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#4FDDE6] rounded-full"></span>
          </button>
          
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Sun className="h-[18px] w-[18px] text-white/70" />
          </button>
          
          <button 
            onClick={onProfileClick}
            className="relative p-1.5 rounded-full transition-all hover:scale-105"
          >
            <div className="h-7 w-7 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
              <span className="text-white/90 text-sm font-medium">T</span>
            </div>
          </button>
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
    </>
  );
};
