import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.svg';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 px-4 py-3">
      <div className="glass flex md:w-auto md:gap-16 md:py-4 md:px-20 text-base w-full rounded-full py-3 px-6 relative shadow-md gap-4 items-center justify-between bg-black/10 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 group relative">
          <img src={logo} alt="Snapceit" className="h-14 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {/* Navigation links space - hidden on login/auth pages */}
        </div>

        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/20">
          <Link to="/login" className="transition-colors text-white/90 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
          <Link to="/login" className="bg-[#4c1d95] hover:bg-[#5b21b6] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-900/20">
            Login
          </Link>
        </div>

        <button 
          className="md:hidden flex items-center justify-center text-white/90 hover:text-white transition-colors relative z-50 w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 duration-200"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
