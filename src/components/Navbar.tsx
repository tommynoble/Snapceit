import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import logo from '../../images/logo.svg';

interface NavbarProps {
  hideLinks?: boolean;
}

const Navbar = ({ hideLinks = false }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Solutions', href: '#action', isRoute: false },
    { label: 'Features', href: '#features', isRoute: false },
    { label: 'Testimonials', href: '#testimonials', isRoute: false },
    { label: 'Pricing', href: '/pricing', isRoute: true },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: href } });
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  // Handle scroll from other pages
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      const href = location.state.scrollTo;
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          const offsetTop = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
        // Clear state
        navigate('/', { replace: true, state: {} });
      }, 100);
    }
  }, [location, navigate]);

  return (
    <nav className="fixed flex w-full z-50 pt-4 px-4 top-0 shadow-sm justify-center">
      <div className="glass flex md:w-auto md:gap-16 md:py-4 md:px-20 text-base w-full rounded-full py-3 px-6 relative shadow-md gap-4 items-center justify-between bg-black/10 backdrop-blur-md">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group relative">
          <img src={logo} alt="Snapceit" className="h-14 w-auto" />
        </Link>

        {/* Desktop Nav Links */}
        {!hideLinks && (
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-base font-semibold transition-colors cursor-pointer ${location.pathname === link.href ? 'text-white' : 'text-white/90 hover:text-white'}`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-base font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>
        )}

        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/20">
          <Link to="/login" className="transition-colors text-white/90 hover:text-white">
            <User size={20} />
          </Link>
          <Link to="/onboarding" className="bg-[#4c1d95] hover:bg-[#5b21b6] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-900/20">
            Try for Free
          </Link>
        </div>

        <button
          className="md:hidden flex items-center justify-center text-white/90 hover:text-white transition-colors relative z-50 w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 duration-200"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 mt-4 mx-2 p-1.5 glass rounded-2xl flex flex-col gap-1 shadow-2xl bg-[#1e1b4b]/95 backdrop-blur-xl border border-white/10 overflow-hidden z-40">
            {!hideLinks && (
              <>
                <div className="flex flex-col p-1">
                  {navLinks.map((link) => (
                    link.isRoute ? (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="text-sm font-medium transition-all text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl flex items-center justify-between"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="flex items-center gap-3">{link.label}</span>
                      </Link>
                    ) : (
                      <a
                        key={link.label}
                        href={link.href}
                        className="text-sm font-medium transition-all text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl flex items-center justify-between"
                        onClick={(e) => handleNavClick(e, link.href)}
                      >
                        <span className="flex items-center gap-3">{link.label}</span>
                      </a>
                    )
                  ))}
                </div>
                <div className="h-px bg-white/10 mx-4 my-1" />
              </>
            )}
            <div className="flex flex-col gap-2 p-2">
              <Link
                to="/onboarding"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-[#4c1d95] hover:bg-[#5b21b6] text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 active:scale-[0.98]"
              >
                Try for Free
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full text-white/70 hover:text-white text-sm font-medium py-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <User size={16} />
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
