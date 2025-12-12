import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, ScanLine, Tag, RefreshCw, PieChart, LogIn, Camera, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../images/logo.svg';
import '../styles/landing.css';

export function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featureSlide, setFeatureSlide] = useState(0);
  const [billingMode, setBillingMode] = useState<'monthly' | 'yearly'>('monthly');

  const navLinks = [
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const id = setInterval(() => {
      setFeatureSlide((prev) => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="landing-bg landing-scrollbar min-h-screen text-white overflow-x-hidden relative">
      {/* Grid overlay */}
      <div className="bg-grid" />
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-fuchsia-500/30 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="fixed flex w-full z-50 pt-4 px-4 top-0 shadow-sm justify-center">
        <div className="glass flex md:w-auto md:gap-16 md:py-4 md:px-20 text-base w-full rounded-full py-3 px-6 relative shadow-md gap-4 items-center justify-between bg-black/10 backdrop-blur-md">
          <button onClick={handleLogoClick} className="flex items-center gap-2 group relative bg-none border-none cursor-pointer">
            <img src={logo} alt="Snapceit" className="h-14 w-auto" />
          </button>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-base font-semibold text-white/90">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/20">
            <Link to="/login" className="transition-colors text-white/90 hover:text-white">
              <User size={20} />
            </Link>
            <Link
              to="/register"
              className="bg-[#4c1d95] hover:bg-[#5b21b6] text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-900/20"
            >
              Start Free Trial
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden flex items-center justify-center text-white/90 hover:text-white transition-colors relative z-50 w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 duration-200"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          {mobileOpen && (
            <div className="absolute top-full left-0 right-0 mt-4 mx-2 p-1.5 glass rounded-2xl flex flex-col gap-1 shadow-2xl bg-[#1e1b4b]/95 backdrop-blur-xl border border-white/10 overflow-hidden z-40">
              <div className="flex flex-col p-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium transition-all text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl flex items-center justify-between"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="flex items-center gap-3">{link.label}</span>
                  </a>
                ))}
              </div>
              <div className="h-px bg-white/10 mx-4 my-1" />
              <div className="flex flex-col gap-2 p-2">
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-[#4c1d95] hover:bg-[#5b21b6] text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 active:scale-[0.98]"
                >
                  Start Free Trial
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

      <main className="pt-32 relative">
        {/* Hero */}
        <section className="z-10 text-center max-w-4xl mx-auto mb-16 px-6 relative">
          <h1 className="z-20 font-manrope mt-20 md:mt-24 mb-6 relative perspective-1000 leading-tight">
            <span className="md:text-7xl text-5xl sm:text-6xl font-medium text-white tracking-tighter drop-shadow-sm block bg-gradient-to-t from-cyan-200 to-white bg-clip-text text-transparent">
              Say Goodbye to old
            </span>
            <span className="md:text-7xl text-5xl sm:text-6xl font-medium text-white tracking-tighter drop-shadow-sm block -mt-2 bg-gradient-to-t from-cyan-200 to-white bg-clip-text text-transparent">
              paper receipts
            </span>
          </h1>
          <p className="leading-relaxed text-base md:text-xl font-normal text-purple-100 max-w-2xl mx-auto mb-10">
            Digitize, organize, and access your receipts effortlessly. Our AI-powered solution makes expense tracking simpler than ever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              to="/register"
              className="group flex gap-2 shiny-cta shadow-purple-900/30 text-base md:text-2xl font-semibold text-white h-14 md:h-16 rounded-lg px-8 md:px-12 relative shadow-xl items-center justify-center mb-[3px]"
            >
              <span className="z-10 relative">Get Started</span>
            </Link>
          </div>
        </section>

        {/* Product preview - Dashboard */}
        <section className="md:px-6 max-w-7xl mr-auto ml-auto pr-4 pl-4 relative perspective-1000 overflow-hidden">
          <style>{`
            @keyframes fadeInUp {
              0% {
                opacity: 0;
                transform: translateY(60px) scale(0.98);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
          `}</style>

          {/* Dashboard Container */}
          <div className="dashboard-shadow overflow-hidden border-[12px] bg-white border-fuchsia-300 rounded-[50px] relative mx-4 md:mx-0" style={{ animation: 'fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards', marginBottom: '-200px' }}>

            {/* Full Dashboard Replacement */}
            <div className="flex flex-col md:flex-row h-[500px] md:h-[720px] w-full bg-[#a855f7] font-sans overflow-y-scroll md:overflow-hidden">
              {/* Sidebar */}
              <div className="hidden md:flex flex-shrink-0 flex flex-col gap-4 z-10 text-white w-64 pt-4 pr-4 pb-4 pl-4" style={{ background: 'linear-gradient(135deg, #D444EF 0%, #AF3AEB 50%, #9d4edd 100%)' }}>
                {/* Logo */}
                <div className="flex items-center gap-2 pl-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-300">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-bold text-xl tracking-tight text-cyan-50/90 font-manrope">snapciet</span>
                </div>

                {/* Search */}
                <div className="relative group">
                  <input type="text" placeholder="Search" className="w-full bg-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all font-light tracking-wide border border-transparent focus:border-white/10" />
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-3 text-white/50 group-focus-within:text-white transition-colors">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>

                {/* Menu */}
                <nav className="flex flex-col gap-1 -ml-2 -mr-2">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/20 rounded-xl font-medium text-sm text-white shadow-sm border border-white/10 backdrop-blur-sm cursor-default pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                    Dashboard
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-white/80 font-medium text-sm cursor-default pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M10 13h4" />
                      <path d="M10 17h4" />
                      <path d="M10 9h1" />
                    </svg>
                    Expenses
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-white/80 font-medium text-sm cursor-default pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-cyan-300 transition-colors">
                      <path d="M12.22 2h-.44a2 2 0 0 1-2-2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73v.18a2 2 0 0 0 2 0v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V2.05a2 2 0 0 0-2-.05Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Settings
                  </div>
                  <div className="pt-2 pb-1" />
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-white/80 font-medium text-sm cursor-default pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-cyan-300 transition-colors">
                      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2 1-2 1Z" />
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                      <path d="M12 17.5v-11" />
                    </svg>
                    Receipts
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-white/80 font-medium text-sm cursor-default pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-cyan-300 transition-colors">
                      <line x1="12" x2="12" y1="20" y2="10" />
                      <line x1="18" x2="18" y1="20" y2="4" />
                      <line x1="6" x2="6" y1="20" y2="16" />
                    </svg>
                    Reports
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 rounded-xl text-white/80 font-medium text-sm cursor-default pointer-events-none">
                    <span className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-cyan-300 transition-colors">
                        <rect width="16" height="20" x="4" y="2" rx="2" />
                        <line x1="8" x2="16" y1="6" y2="6" />
                        <line x1="16" x2="16" y1="14" y2="18" />
                        <path d="M16 10h.01" />
                        <path d="M12 10h.01" />
                        <path d="M8 10h.01" />
                        <path d="M12 14h.01" />
                        <path d="M8 14h.01" />
                        <path d="M12 18h.01" />
                        <path d="M8 18h.01" />
                      </svg>
                      Prepare Taxes
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-white/80 font-medium text-sm cursor-default pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-cyan-300 transition-colors">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile
                    </div>
                  </div>
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-hidden p-3 md:p-5 text-slate-800 relative z-0 w-full" style={{ background: 'linear-gradient(135deg, #D444EF 0%, #AF3AEB 50%, #581c87 100%)' }}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-full h-full bg-white/5 pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 mt-4 text-white relative z-10">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                    <h2 className="text-2xl md:text-3xl font-bold font-manrope tracking-tight">Good evening, there!</h2>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:hidden">
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 relative z-10">
                  {/* Card 1: Tax Summary (White) */}
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-white/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">Tax Summary</span>
                      <div className="p-1.5 bg-blue-50 text-blue-500 rounded-md shadow-sm border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2 1-2 1Z" />
                          <path d="M14 8H8" />
                          <path d="M16 12H8" />
                          <path d="M13 16H8" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-5 font-manrope tracking-tight">$0.00</div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-slate-400">Avg. Tax Rate</span> <span className="text-slate-900">0%</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-slate-400">Est. Savings</span>
                        <span className="text-emerald-500">$0.00</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-slate-400">Total Receipts</span>
                        <span className="text-slate-900">16</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-slate-400">Deductible</span> <span className="text-blue-500">$0.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Total Spending */}
                  <div className="rounded-xl p-5 text-white shadow-lg border border-white/20 relative overflow-hidden backdrop-blur-md" style={{ background: 'linear-gradient(135deg, rgba(212, 68, 239, 0.4) 0%, rgba(175, 58, 235, 0.3) 50%, rgba(88, 28, 135, 0.2) 100%)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className="text-xs font-semibold text-white/80 font-sans tracking-wide">Total Spending</span>
                      <div className="p-1.5 bg-white/20 text-white rounded-md backdrop-blur-sm border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v20" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-5 font-manrope tracking-tight relative z-10">$5,003.51</div>
                    <div className="space-y-2.5 relative z-10">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-white/60">Trend</span>
                        <span className="text-emerald-300 flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m18 15-6-6-6 6" />
                          </svg>
                          9.4%
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-white/60">Categories</span> <span className="text-white">4</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-white/60">Receipts</span> <span className="text-white">16</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Monthly Spending */}
                  <div className="rounded-xl p-5 text-white shadow-lg border border-white/20 relative overflow-hidden backdrop-blur-md" style={{ background: 'linear-gradient(135deg, rgba(212, 68, 239, 0.4) 0%, rgba(175, 58, 235, 0.3) 50%, rgba(88, 28, 135, 0.2) 100%)' }}>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className="text-xs font-semibold text-white/80 font-sans tracking-wide">Monthly Spending</span>
                      <div className="p-1.5 bg-white/20 text-white rounded-md backdrop-blur-sm border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m3 11 18-5v12L3 14v-3z" />
                          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-6 font-manrope tracking-tight relative z-10">$5,003.51</div>
                    <div className="space-y-4 relative z-10">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider font-bold text-white/50 mb-1">Monthly Trend</div>
                        <div className="text-lg font-bold text-emerald-300 flex items-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m5 12 7-7 7 7" />
                            <path d="M12 19V5" />
                          </svg>
                          0%
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider font-bold text-white/50 mb-1">Tax Amount</div>
                        <div className="text-lg font-bold text-cyan-200">$NaN</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Categories */}
                  <div className="rounded-xl p-5 text-white shadow-lg border border-white/20 relative overflow-hidden backdrop-blur-md" style={{ background: 'linear-gradient(135deg, rgba(212, 68, 239, 0.4) 0%, rgba(175, 58, 235, 0.3) 50%, rgba(88, 28, 135, 0.2) 100%)' }}>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className="text-xs font-semibold text-white/80 font-sans tracking-wide">Categories</span>
                      <div className="p-1.5 bg-white/20 text-white rounded-md backdrop-blur-sm border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                          <path d="M22 12A10 10 0 0 0 12 2v10z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-5 font-manrope tracking-tight relative z-10">4</div>
                    <div className="space-y-3 relative z-10 pt-1">
                      {/* Item 1 */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-medium text-white/90">
                          <span>Supplies</span>
                          <span>81%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-pink-400 rounded-full" style={{ width: '81%' }} />
                        </div>
                      </div>
                      {/* Item 2 */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-medium text-white/90">
                          <span>Utilities</span>
                          <span>12%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-300 rounded-full" style={{ width: '12%' }} />
                        </div>
                      </div>
                      {/* Item 3 */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-medium text-white/90">
                          <span>Meals</span>
                          <span>5%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-300 rounded-full" style={{ width: '5%' }} />
                        </div>
                      </div>
                      {/* Item 4 */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-medium text-white/90">
                          <span>Other Expenses</span>
                          <span>2%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-300 rounded-full" style={{ width: '2%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Split Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                  {/* Left Col (Wide) */}
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    {/* Upload Section (White) */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/50">
                      <h3 className="font-bold text-xl mb-6 font-manrope tracking-tight text-slate-900">Upload Receipt</h3>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl h-56 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50/30">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-slate-400 group-hover:text-purple-600 group-hover:scale-110 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" x2="12" y1="3" y2="15" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700">Drag &amp; drop receipts, or click to select</p>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Supported formats: JPG, PNG, PDF (max 10MB) • Upload multiple files at once</p>
                      </div>
                    </div>

                    {/* Recent Receipts (White) */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/50">
                      <div className="flex items-center gap-4 mb-6">
                        <h3 className="font-bold text-lg font-manrope text-slate-900">Recent Receipts</h3>
                        <span className="text-[10px] font-semibold tracking-wide bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200 uppercase">Select Mode</span>
                      </div>
                      <div className="space-y-3">
                        {/* Item 1 */}
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-purple-200 hover:shadow-md transition-all group bg-slate-50/30">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">$352.25</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-slate-500">Abc Furniture Co</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-semibold border border-yellow-200/50">Utilities</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-semibold border border-yellow-200/50">High (80%)</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 font-medium">Uploaded: Nov 29, 2025, 10:33 PM</div>
                            </div>
                          </div>
                          <button className="text-slate-300 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>
                        </div>

                        {/* Item 2 */}
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-purple-200 hover:shadow-md transition-all group bg-slate-50/30">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                                <path d="M3 9h18" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">$9.71</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-slate-500">Best Buy</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-semibold border border-orange-200/50">Supplies</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-semibold border border-orange-200/50">High (85%)</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-medium">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                  <line x1="16" x2="16" y1="2" y2="6" />
                                  <line x1="8" x2="8" y1="2" y2="6" />
                                  <line x1="3" x2="21" y1="10" y2="10" />
                                </svg>
                                Dec 3, 2025
                              </div>
                            </div>
                          </div>
                          <button className="text-slate-300 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>
                        </div>

                        {/* Item 3 */}
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-purple-200 hover:shadow-md transition-all group bg-slate-50/30">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                                <path d="M7 2v20" />
                                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">$54.50</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-slate-500">Berghotel</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200/50">Meals</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200/50">High (90%)</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 font-medium">Uploaded: Nov 29, 2025, 11:28 AM</div>
                            </div>
                          </div>
                          <button className="text-slate-300 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Col (Narrow) */}
                  <div className="col-span-1 space-y-4">
                    {/* Chart */}
                    <div className="rounded-2xl p-6 text-white shadow-xl border border-white/20 h-[380px] flex flex-col backdrop-blur-md" style={{ background: 'linear-gradient(135deg, rgba(212, 68, 239, 0.4) 0%, rgba(175, 58, 235, 0.3) 50%, rgba(88, 28, 135, 0.2) 100%)' }}>
                      <h3 className="font-medium text-base mb-8 text-white/90">Top Merchants by Spending</h3>
                      <div className="flex-1 flex items-end gap-3 justify-between pl-8 relative text-xs text-white/60">
                        {/* Y Axis Labels */}
                        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between items-end pr-2 text-[9px] w-8 border-r border-white/10 font-mono">
                          <span>$2200</span>
                          <span>$1650</span>
                          <span>$1100</span>
                          <span>$550</span>
                          <span>$0</span>
                        </div>

                        {/* Bar 1 */}
                        <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                          <div className="w-full bg-white/20 rounded-t-sm transition-all duration-300 group-hover:bg-white/30 h-[80%]" />
                          <span className="text-[9px] rotate-45 origin-left translate-x-1 mt-2">Stbaw</span>
                        </div>
                        {/* Bar 2 */}
                        <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                          <div className="w-full bg-white/20 rounded-t-sm transition-all duration-300 group-hover:bg-white/30 h-[75%]" />
                          <span className="text-[9px] rotate-45 origin-left translate-x-1 mt-2">Kmart</span>
                        </div>
                        {/* Bar 3 */}
                        <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                          <div className="w-full bg-white/20 rounded-t-sm transition-all duration-300 group-hover:bg-white/30 h-[20%]" />
                          <span className="text-[9px] rotate-45 origin-left translate-x-1 mt-2">Abc Furniture...</span>
                        </div>
                        {/* Bar 4 */}
                        <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                          <div className="w-full bg-white/20 rounded-t-sm transition-all duration-300 group-hover:bg-white/30 h-[15%]" />
                          <span className="text-[9px] rotate-45 origin-left translate-x-1 mt-2">Ace®</span>
                        </div>
                        {/* Bar 5 */}
                        <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                          <div className="w-full bg-white/20 rounded-t-sm transition-all duration-300 group-hover:bg-white/30 h-[5%]" />
                          <span className="text-[9px] rotate-45 origin-left translate-x-1 mt-2">Marshalls.</span>
                        </div>

                        {/* Horizontal Grid Lines */}
                        <div className="absolute inset-0 pointer-events-none z-0">
                          <div className="w-full h-px bg-white/10 absolute top-[0%] left-8" />
                          <div className="w-full h-px bg-white/10 absolute top-[25%] left-8" />
                          <div className="w-full h-px bg-white/10 absolute top-[50%] left-8" />
                          <div className="w-full h-px bg-white/10 absolute top-[75%] left-8" />
                          <div className="w-full h-px bg-white/10 absolute bottom-[24px] left-8" />
                        </div>
                      </div>
                    </div>

                    {/* Reminders (White) */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/50 h-[230px] flex flex-col">
                      <h3 className="font-bold text-lg mb-4 font-manrope text-slate-900">Reminders</h3>
                      <div className="space-y-3">
                        <div className="bg-emerald-50 rounded-lg p-4 flex gap-3 border border-emerald-100/50">
                          <div className="mt-0.5 text-emerald-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-emerald-900">16 receipts categorized</div>
                            <div className="text-xs text-emerald-700/80 font-medium">All receipts are up to date</div>
                          </div>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-4 flex gap-3 border border-emerald-100/50">
                          <div className="mt-0.5 text-emerald-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-emerald-900">Spending patterns are normal</div>
                            <div className="text-xs text-emerald-700/80 font-medium">Your spending is within normal range</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="z-20 text-center mt-16 pt-10 pb-20 relative">
          <p className="text-2xl font-medium text-white mb-8">Snapciet is loved by millions of businesses</p>
          <div className="flex flex-wrap gap-x-4 gap-y-4 items-center justify-center">
            {/* Badge 1 - Google */}
            <div className="flex gap-3 bg-[#581c87]/50 border-2 border-white/40 rounded-full px-6 py-3 items-center shadow-lg shadow-purple-900/10">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-sans text-yellow-400">★</span>
              <span className="text-lg font-semibold font-sans text-white tracking-tight">2.06M</span>
            </div>
            {/* Badge 2 - Yelp */}
            <div className="bg-[#581c87]/50 rounded-full px-6 py-3 flex items-center gap-3 border-2 border-white/40 shadow-lg shadow-purple-900/10">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-red-400">
                <path d="M10.5 1.5h-3v8.5H1.5v3h6v8.5h3v-8.5h8.5v-3h-8.5V1.5z"/>
              </svg>
              <span className="text-sm font-sans text-yellow-400">★</span>
              <span className="text-lg font-semibold font-sans text-white tracking-tight">1.03M</span>
            </div>
            {/* Badge 3 - LinkedIn */}
            <div className="bg-[#581c87]/50 rounded-full px-6 py-3 flex items-center gap-3 border-2 border-white/40 shadow-lg shadow-purple-900/10">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-blue-400">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.736 0-9.646h3.554v1.348c-.009.015-.023.029-.032.045h.032v-.045c.418-.645 1.162-1.571 2.828-1.571 2.065 0 3.613 1.349 3.613 4.253v5.616zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.951.77-1.71 1.915-1.71 1.144 0 1.915.759 1.915 1.71 0 .951-.771 1.71-1.915 1.71zm1.575 11.597H3.762V9.906h3.15v10.546zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
              </svg>
              <span className="text-sm font-sans text-yellow-400">★</span>
              <span className="text-lg font-semibold font-sans text-white tracking-tight">40.0K</span>
            </div>
            {/* Badge 4 - Trustpilot */}
            <div className="bg-[#581c87]/50 rounded-full px-6 py-3 flex items-center gap-3 border-2 border-white/40 shadow-lg shadow-purple-900/10">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-green-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-sm font-sans text-yellow-400">★</span>
              <span className="text-lg font-semibold font-sans text-white tracking-tight">4.5K</span>
            </div>
          </div>
          <p className="text-base mt-6 font-sans text-white/60">available in 5+ countries</p>
        </section>

        {/* Features / Bento - light theme variation */}
        <motion.section
          className="overflow-hidden md:pt-24 z-30 bg-white border-white/20 border-t pt-24 pb-24 relative shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)]"
          id="action"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="z-10 max-w-6xl mx-auto px-6 relative">
            <motion.div 
              className="max-w-2xl mx-auto text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <h2 className="sm:text-5xl md:text-6xl text-4xl font-semibold text-zinc-900 tracking-tight font-manrope mb-6">
                Automate your entire financial workflow
              </h2>
              <p className="text-lg text-zinc-500 font-light">
                Automate your entire financial workflow with smart receipt scanning and categorization.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6 max-w-[1800px] w-full mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <motion.div 
                className="group overflow-hidden transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(168,85,247,0.12)] flex flex-col gap-6 bg-gradient-to-br from-purple-200 via-purple-100 to-purple-50 border-purple-200/90 border rounded-2xl p-10 relative shadow-sm items-start min-h-[300px]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-colors duration-500" />
                <div className="flex-1 z-10">
                  <div className="w-12 h-12 rounded-lg bg-purple-200 flex items-center justify-center text-purple-600 mb-6">
                    <LogIn width={32} height={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 tracking-tight mb-3">Quick Setup</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-600 transition-colors">
                    Get started in seconds with a free account. No credit card required - just sign up and start transforming your receipts into insights.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="group overflow-hidden transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(234,88,12,0.12)] bg-gradient-to-br from-orange-200 via-orange-100 to-orange-50 border-orange-200/90 border rounded-2xl p-10 relative shadow-sm min-h-[300px]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-orange-500/5 blur-3xl group-hover:bg-orange-500/10 transition-colors duration-500" />
                <div className="w-12 h-12 rounded-lg bg-orange-200 flex items-center justify-center text-orange-600 mb-6">
                  <Camera width={32} height={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Instant Scanning</h3>
                <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-600 transition-colors">
                  Simply snap a photo of your receipt and watch as our AI instantly extracts all important details. No more manual data entry!
                </p>
              </motion.div>

              <motion.div 
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-200 via-blue-100 to-blue-50 p-10 shadow-sm transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.12)] border border-blue-200/90 min-h-[300px]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />
                <div className="w-12 h-12 rounded-lg bg-blue-200 flex items-center justify-center text-blue-600 mb-6">
                  <BarChart3 width={32} height={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Smart Insights</h3>
                <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-600 transition-colors">
                  Track spending patterns, set budgets, and get personalized insights to help you make smarter financial decisions.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Feature slider */}
        <section className="z-10 overflow-hidden md:pt-24 md:pb-24 pt-16 pb-16 relative" id="action">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
            <div className="overflow-hidden rounded-3xl relative backdrop-blur-2xl">
              <div className="md:py-24 max-w-7xl mx-auto md:pt-20 md:px-8 pt-12 px-4 md:pb-20 pb-12 relative">
                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                  <div className="flex flex-col justify-center min-h-[360px] relative order-2 md:order-1">
                    {[
                      {
                        badge: 'App Features',
                        title: 'Scan receipts instantly',
                        copy: 'Simply point your camera at any receipt and our AI instantly extracts all the important details. No more manual data entry.',
                        tone: 'purple',
                      },
                      {
                        badge: 'App Features',
                        title: 'Organize and categorize',
                        copy: 'Automatically categorize expenses, track spending patterns, and get insights into your financial health in real-time.',
                        tone: 'blue',
                      },
                      {
                        badge: 'App Features',
                        title: 'Sync with QuickBooks',
                        copy: 'Automatically sync your receipt data directly to QuickBooks. No manual entry, no delays. Your financial records stay perfectly in sync.',
                        tone: 'emerald',
                      },
                    ].map((slide, idx) => (
                      <div
                        key={slide.title}
                        className={`transition-all duration-1000 ease-out ${featureSlide === idx ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}
                      >
                        <div className={`inline-flex gap-2 text-xs font-medium rounded-full mb-6 px-3 py-1 backdrop-blur-md border ${
                          slide.tone === 'purple'
                            ? 'text-purple-200 bg-purple-500/10 border-purple-500/20'
                            : slide.tone === 'blue'
                              ? 'text-blue-200 bg-blue-500/10 border-blue-500/20'
                              : 'text-emerald-200 bg-emerald-500/10 border-emerald-500/20'
                        }`}>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                          </span>
                          {slide.badge}
                        </div>
                        <h2 className="sm:text-5xl md:text-6xl text-4xl font-semibold text-white tracking-tight font-manrope leading-tight">
                          {slide.title}
                        </h2>
                        <p className="leading-relaxed text-lg text-purple-100/80 max-w-lg mt-6">
                          {slide.copy}
                        </p>
                        <button className="mt-6 text-purple-300 hover:text-purple-200 font-medium transition-colors inline-flex items-center gap-2 pr-1">
                          Learn more
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-4 mt-12 items-center">
                      <button
                        onClick={() => setFeatureSlide((s) => (s - 1 + 3) % 3)}
                        className="group h-12 w-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm flex items-center justify-center transition-all active:scale-95"
                        aria-label="Previous slide"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white transition-colors"><path d="m15 18-6-6 6-6"></path></svg>
                      </button>
                      <div className="flex gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                        {[0, 1, 2].map((idx) => (
                          <button
                            key={idx}
                            onClick={() => setFeatureSlide(idx)}
                            className={featureSlide === idx ? 'h-1.5 w-8 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500' : 'h-1.5 w-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-all duration-500'}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setFeatureSlide((s) => (s + 1) % 3)}
                        className="group h-12 w-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm flex items-center justify-center transition-all active:scale-95"
                        aria-label="Next slide"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white transition-colors"><path d="m9 18 6-6-6-6"></path></svg>
                      </button>
                    </div>
                  </div>

                  <div className="relative h-full md:min-h-[480px] min-h-[360px] flex items-center order-1 md:order-2">
                    <div className="grid grid-cols-1 grid-rows-1 w-full relative">
                      {[
                        { icon: Camera, color: 'from-purple-500 to-purple-600', image: '/scan.jpg' },
                        { icon: Tag, color: 'from-blue-500 to-blue-600', image: '/organize.jpg' },
                        { icon: RefreshCw, color: 'from-emerald-500 to-emerald-600', image: '/quick.jpg' },
                      ].map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                          <div
                            key={idx}
                            className={`col-start-1 row-start-1 w-full transition-all duration-1000 ease-in-out transform ${featureSlide === idx ? 'opacity-100 scale-100 translate-x-0 z-10' : 'opacity-0 scale-95 translate-x-12 pointer-events-none'}`}
                          >
                            <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl h-full min-h-[480px] flex items-center justify-center border-4 border-purple-400/40 shadow-[0_0_60px_rgba(147,51,234,0.6)]">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                              {item.image ? (
                                <img src={item.image} alt="Feature" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                              ) : (
                                <div className={`relative z-10 flex flex-col items-center gap-6`}>
                                  <div className={`bg-gradient-to-br ${item.color} p-8 rounded-2xl shadow-2xl`}>
                                    <IconComponent size={64} className="text-white" strokeWidth={1.5} />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-white/60 text-sm font-medium">Feature Preview</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Powerful Features for Your Receipts */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
          className="md:pt-24 z-30 bg-white border-white/20 border-t pt-24 pb-24 relative shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)]"
          id="features"
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="z-10 max-w-6xl mx-auto px-6 relative">
            <motion.div 
              className="max-w-2xl mx-auto text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <h2 className="sm:text-5xl md:text-6xl text-4xl font-semibold text-zinc-900 tracking-tight font-manrope mb-6">
                Powerful Features for Your Receipts
              </h2>
              <p className="text-lg text-zinc-500 font-light">
                Organize, categorize, and extract insights from your receipts instantly.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-[1750px] mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              {/* Card 1: Smart Receipt Organization */}
              <motion.div 
                className="group relative overflow-hidden rounded-3xl p-6 h-[290px] flex flex-col transition-all duration-500 hover:-translate-y-2" 
                style={{background: 'linear-gradient(to right, #D444EF 0%, #7431CA 100%)'}}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
                <div className="mb-6 relative z-10">
                  <div className="rounded-2xl p-4 w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{background: 'rgba(0, 153, 255, 0.08)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8" style={{color: '#FFFFFF'}}>
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-50 transition-colors">Smart Receipt Organization</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 font-medium">Automatically categorize and sort your receipts by date, vendor, or expense type. Never lose track again.</p>
                <div className="mt-auto flex items-center cursor-pointer group/readmore relative z-10">
                  <span className="font-bold tracking-wide text-sm group-hover:text-white transition-colors" style={{color: 'rgb(215 228 249 / 80%)'}}>Learn more</span>
                  <div className="relative w-5 h-5 ml-2 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform group-hover:-translate-x-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Instant Search & Retrieval */}
              <motion.div 
                className="group relative overflow-hidden rounded-3xl p-6 h-[290px] flex flex-col transition-all duration-500 hover:-translate-y-2" 
                style={{background: 'linear-gradient(to right, #D444EF 0%, #7431CA 100%)'}}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
                <div className="mb-6 relative z-10">
                  <div className="rounded-2xl p-4 w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{background: 'rgba(0, 153, 255, 0.08)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8" style={{color: '#FFFFFF'}}>
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-50 transition-colors">Instant Search &amp; Retrieval</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 font-medium">Find any receipt in seconds with our powerful search feature. Filter by date, amount, or vendor instantly.</p>
                <div className="mt-auto flex items-center cursor-pointer group/readmore relative z-10">
                  <span className="font-bold tracking-wide text-sm group-hover:text-white transition-colors" style={{color: 'rgb(215 228 249 / 80%)'}}>Learn more</span>
                  <div className="relative w-5 h-5 ml-2 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform group-hover:-translate-x-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Advanced Analytics */}
              <motion.div 
                className="group relative overflow-hidden rounded-3xl p-6 h-[290px] flex flex-col transition-all duration-500 hover:-translate-y-2" 
                style={{background: 'linear-gradient(to right, #D444EF 0%, #7431CA 100%)'}}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
                <div className="mb-6 relative z-10">
                  <div className="rounded-2xl p-4 w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{background: 'rgba(0, 153, 255, 0.08)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8" style={{color: '#FFFFFF'}}>
                      <path d="M3 3v18h18"></path>
                      <path d="M18 17V9"></path>
                      <path d="M13 17V5"></path>
                      <path d="M8 17v-3"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-50 transition-colors">Advanced Analytics</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 font-medium">Gain valuable insights into your spending patterns with detailed analytics and visualizations.</p>
                <div className="mt-auto flex items-center cursor-pointer group/readmore relative z-10">
                  <span className="font-bold tracking-wide text-sm group-hover:text-white transition-colors" style={{color: 'rgb(215 228 249 / 80%)'}}>Learn more</span>
                  <div className="relative w-5 h-5 ml-2 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform group-hover:-translate-x-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 4: Tax Deduction Tracking */}
              <motion.div 
                className="group relative overflow-hidden rounded-3xl p-6 h-[290px] flex flex-col transition-all duration-500 hover:-translate-y-2" 
                style={{background: 'linear-gradient(to right, #D444EF 0%, #7431CA 100%)'}}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
                <div className="mb-6 relative z-10">
                  <div className="rounded-2xl p-4 w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{background: 'rgba(0, 153, 255, 0.08)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8" style={{color: '#FFFFFF'}}>
                      <rect width="16" height="20" x="4" y="2" rx="2"></rect>
                      <line x1="8" x2="16" y1="6" y2="6"></line>
                      <line x1="16" x2="16" y1="14" y2="18"></line>
                      <path d="M16 10h.01"></path>
                      <path d="M12 10h.01"></path>
                      <path d="M8 10h.01"></path>
                      <path d="M12 14h.01"></path>
                      <path d="M8 14h.01"></path>
                      <path d="M12 18h.01"></path>
                      <path d="M8 18h.01"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-50 transition-colors">Tax Deduction Tracking</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 font-medium">Automatically identify potential tax deductions from your receipts. Save money during tax season.</p>
                <div className="mt-auto flex items-center cursor-pointer group/readmore relative z-10">
                  <span className="font-bold tracking-wide text-sm group-hover:text-white transition-colors" style={{color: 'rgb(215 228 249 / 80%)'}}>Learn more</span>
                  <div className="relative w-5 h-5 ml-2 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform group-hover:-translate-x-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 5: Price Match & Refunds */}
              <motion.div 
                className="group relative overflow-hidden rounded-3xl p-6 h-[290px] flex flex-col transition-all duration-500 hover:-translate-y-2" 
                style={{background: 'linear-gradient(to right, #D444EF 0%, #7431CA 100%)'}}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.32 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
                <div className="mb-6 relative z-10">
                  <div className="rounded-2xl p-4 w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{background: 'rgba(0, 153, 255, 0.08)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8" style={{color: '#FFFFFF'}}>
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-50 transition-colors">Price Match &amp; Refunds</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 font-medium">Get alerts when prices drop on your purchases. Never miss out on potential refunds or price matches.</p>
                <div className="mt-auto flex items-center cursor-pointer group/readmore relative z-10">
                  <span className="font-bold tracking-wide text-sm group-hover:text-white transition-colors" style={{color: 'rgb(215 228 249 / 80%)'}}>Learn more</span>
                  <div className="relative w-5 h-5 ml-2 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform group-hover:-translate-x-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 6: Smart Categorization */}
              <motion.div 
                className="group relative overflow-hidden rounded-3xl p-6 h-[290px] flex flex-col transition-all duration-500 hover:-translate-y-2" 
                style={{background: 'linear-gradient(to right, #D444EF 0%, #7431CA 100%)'}}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
                <div className="mb-6 relative z-10">
                  <div className="rounded-2xl p-4 w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{background: 'rgba(0, 153, 255, 0.08)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8" style={{color: '#FFFFFF'}}>
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <path d="M12 11h4"></path>
                      <path d="M12 16h4"></path>
                      <path d="M8 11h.01"></path>
                      <path d="M8 16h.01"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-50 transition-colors">Smart Categorization</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 font-medium">Our AI automatically categorizes your expenses. Track spending patterns across different categories with ease.</p>
                <div className="mt-auto flex items-center cursor-pointer group/readmore relative z-10">
                  <span className="font-bold tracking-wide text-sm group-hover:text-white transition-colors" style={{color: 'rgb(215 228 249 / 80%)'}}>Learn more</span>
                  <div className="relative w-5 h-5 ml-2 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform group-hover:-translate-x-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5" style={{color: 'rgb(215 228 249 / 60%)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section 
          id="testimonials" 
          className="relative overflow-hidden bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 py-32"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-96 h-96">
              <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-3xl animate-random-1"></div>
            </div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px]">
              <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-3xl animate-random-2"></div>
            </div>
            <div className="absolute top-1/3 right-1/3 w-72 h-72">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-random-3"></div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="sm:text-5xl md:text-6xl text-4xl font-semibold text-white tracking-tight font-manrope mb-6">Businesses love Snapceit</h2>
              <p className="text-lg text-white/80 font-light">Trusted by thousands of businesses worldwide to streamline receipt management.</p>
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <div className="flex gap-6 pl-8 animate-scroll" style={{animation: 'scroll 30s linear infinite'}}>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Transformed Our Receipt Management</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">This app has completely transformed how we handle receipts. The OCR accuracy is impressive!</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Sarah Johnson</p>
                    <p className="text-white/70 text-sm">CFO</p>
                    <p className="text-white/70 text-sm">Microsoft</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/microsoft-5.svg" alt="Microsoft" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Seamless QuickBooks Integration</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">Integration with QuickBooks was seamless. Saved us countless hours of manual data entry.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Michael Chen</p>
                    <p className="text-white/70 text-sm">Small Business Owner</p>
                    <p className="text-white/70 text-sm">Salesforce</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/salesforce-2.svg" alt="Salesforce" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Best Receipt Scanner</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">The best receipt scanner we've used. The mobile app is intuitive and fast.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Emma Davis</p>
                    <p className="text-white/70 text-sm">Accounting Manager</p>
                    <p className="text-white/70 text-sm">Adobe</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/adobe-2.svg" alt="Adobe" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Exceptional Support</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">Customer support is exceptional. They helped us set up custom integrations quickly.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">James Wilson</p>
                    <p className="text-white/70 text-sm">Operations Director</p>
                    <p className="text-white/70 text-sm">Shopify</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Great Analytics Insights</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">The analytics dashboard gives us great insights into our expenses.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Lisa Thompson</p>
                    <p className="text-white/70 text-sm">Finance Director</p>
                    <p className="text-white/70 text-sm">Stripe</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/stripe-3.svg" alt="Stripe" className="h-full w-full object-contain brightness-0 invert" />
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Transformed Our Receipt Management</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">This app has completely transformed how we handle receipts. The OCR accuracy is impressive!</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Sarah Johnson</p>
                    <p className="text-white/70 text-sm">CFO</p>
                    <p className="text-white/70 text-sm">Microsoft</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/microsoft-5.svg" alt="Microsoft" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Seamless QuickBooks Integration</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">Integration with QuickBooks was seamless. Saved us countless hours of manual data entry.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Michael Chen</p>
                    <p className="text-white/70 text-sm">Small Business Owner</p>
                    <p className="text-white/70 text-sm">Salesforce</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/salesforce-2.svg" alt="Salesforce" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Best Receipt Scanner</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">The best receipt scanner we've used. The mobile app is intuitive and fast.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Emma Davis</p>
                    <p className="text-white/70 text-sm">Accounting Manager</p>
                    <p className="text-white/70 text-sm">Adobe</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/adobe-2.svg" alt="Adobe" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Exceptional Support</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">Customer support is exceptional. They helped us set up custom integrations quickly.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">James Wilson</p>
                    <p className="text-white/70 text-sm">Operations Director</p>
                    <p className="text-white/70 text-sm">Shopify</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Great Analytics Insights</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">The analytics dashboard gives us great insights into our expenses.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Lisa Thompson</p>
                    <p className="text-white/70 text-sm">Finance Director</p>
                    <p className="text-white/70 text-sm">Stripe</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                    <img src="https://cdn.worldvectorlogo.com/logos/stripe-3.svg" alt="Stripe" className="h-full w-full object-contain brightness-0 invert" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Pricing */}
        <motion.section 
          className="md:py-32 z-10 bg-white mt-0 mb-0 pt-24 pb-24 relative" 
          id="pricing"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="lg:px-8 max-w-6xl mx-auto px-6 relative">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="sm:text-5xl md:text-6xl text-4xl font-semibold leading-tight font-manrope text-zinc-900 tracking-tight">
                Pricing that grows
                <br />
                with you
              </h2>
              <p className="mt-3 text-sm md:text-base text-zinc-600 max-w-2xl mx-auto font-light">
                Start small, scale when your financial complexity grows. Every plan includes the AI extraction engine.
              </p>
            </div>

            <div className="flex justify-center mb-14">
              <div className="inline-flex items-center rounded-full bg-zinc-300/30 backdrop-blur-xl px-1.5 py-1.5 text-sm shadow-lg">
                <button
                  type="button"
                  onClick={() => setBillingMode('monthly')}
                  className={`rounded-full px-8 py-3 font-semibold transition-all duration-300 ${billingMode === 'monthly' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400'}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingMode('yearly')}
                  className={`rounded-full px-8 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${billingMode === 'yearly' ? 'bg-cyan-300/40 text-zinc-900 shadow-lg border border-cyan-400/50' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Yearly
                  <span className="inline-flex items-center rounded-full bg-cyan-300/40 px-3 py-1 text-[11px] font-bold text-cyan-600 border border-cyan-400/50">
                    SAVE 30%
                  </span>
                </button>
              </div>
            </div>

            <motion.div 
              className="grid gap-6 md:gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <motion.div 
                className="rounded-[32px] bg-white px-8 py-8 flex flex-col justify-between shadow-lg border-2 border-zinc-200 h-fit"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div>
                  <h3 className="text-xl mb-2 font-semibold font-manrope tracking-tight text-zinc-900">Starter</h3>
                  <p className="text-sm text-zinc-600 mb-8 font-light">
                    For freelancers who want AI assistance on every receipt without the team features.
                  </p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl tracking-tight font-medium text-zinc-900">{billingMode === 'monthly' ? '$0' : '$0'}</span>
                      <span className="text-zinc-500 font-light text-sm">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8 text-sm text-zinc-600">
                    <li className="flex items-start gap-3"><span className="text-blue-500 font-bold">●</span> 50 Receipts / mo</li>
                    <li className="flex items-start gap-3"><span className="text-blue-500 font-bold">●</span> 1 User Seat</li>
                    <li className="flex items-start gap-3"><span className="text-blue-500 font-bold">●</span> Basic CSV Export</li>
                    <li className="flex items-start gap-3"><span className="text-blue-500 font-bold">●</span> Mobile App Access</li>
                    <li className="flex items-start gap-3 text-zinc-500"><span className="text-zinc-400 font-bold">●</span> Accounting Sync</li>
                  </ul>
                </div>
                <Link to="/register" className="block w-full py-3 px-6 text-center rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">
                  Get started
                </Link>
              </motion.div>

              <motion.div 
                className="flex flex-col transition-transform hover:scale-105 duration-300 bg-white z-10 rounded-[32px] px-8 py-10 relative shadow-lg ring-4 ring-purple-500 ring-opacity-50 justify-between"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg tracking-wide uppercase">
                  Most Popular
                </div>
                <div>
                  <h3 className="text-xl mb-2 font-semibold font-manrope tracking-tight text-zinc-900">Professional</h3>
                  <p className="text-sm text-zinc-600 mb-8 font-light">
                    Automate your entire team's expenses with direct accounting sync.
                  </p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl tracking-tight font-medium text-zinc-900">{billingMode === 'monthly' ? '$29' : '$19'}</span>
                      <span className="text-zinc-500 font-light text-sm">/mo</span>
                    </div>
                    <p className={`text-xs text-purple-300 h-4 mb-2 font-medium transition-opacity duration-300 ${billingMode === 'yearly' ? 'opacity-100' : 'opacity-0'}`}>
                      Billed $228 yearly
                    </p>
                  </div>
                  <ul className="space-y-4 mb-8 text-sm text-zinc-700">
                    <li className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1"><path d="M20 6 9 17l-5-5"></path></svg> Unlimited Receipts</li>
                    <li className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1"><path d="M20 6 9 17l-5-5"></path></svg> 5 User Seats</li>
                    <li className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1"><path d="M20 6 9 17l-5-5"></path></svg> QuickBooks &amp; Xero Sync</li>
                    <li className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1"><path d="M20 6 9 17l-5-5"></path></svg> Approval Workflows</li>
                    <li className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1"><path d="M20 6 9 17l-5-5"></path></svg> Advanced Analytics</li>
                    <li className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1"><path d="M20 6 9 17l-5-5"></path></svg> Tax Deductions Tracking</li>
                    <li className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1"><path d="M20 6 9 17l-5-5"></path></svg> Price Match &amp; Refund Alerts</li>
                    <li className="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 flex-none bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1"><path d="M20 6 9 17l-5-5"></path></svg> Priority Support</li>
                  </ul>
                </div>
                <Link to="/register" className="group flex gap-2 shiny-cta shadow-purple-900/30 text-lg font-semibold text-white h-12 rounded-lg px-8 relative shadow-xl items-center justify-center w-full">
                  <span className="z-10 relative">Get started</span>
                </Link>
              </motion.div>

              <motion.div 
                className="rounded-[32px] bg-white outline outline-2 outline-zinc-200 px-8 py-8 flex flex-col justify-between shadow-lg h-fit"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div>
                  <h3 className="text-xl mb-2 font-semibold font-manrope tracking-tight text-zinc-900">Enterprise</h3>
                  <p className="text-sm text-zinc-600 mb-8 font-light">
                    Custom security, compliance and support for large organizations.
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl tracking-tight font-medium text-zinc-900">Custom</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-sm text-zinc-600">
                    <li className="flex items-start gap-3"><span className="text-orange-500 font-bold">●</span> Unlimited Users</li>
                    <li className="flex items-start gap-3"><span className="text-orange-500 font-bold">●</span> SSO (Okta, Google)</li>
                    <li className="flex items-start gap-3"><span className="text-orange-500 font-bold">●</span> Dedicated Success Manager</li>
                    <li className="flex items-start gap-3"><span className="text-orange-500 font-bold">●</span> Custom ERP Integrations</li>
                    <li className="flex items-start gap-3"><span className="text-orange-500 font-bold">●</span> Advanced Security & Compliance</li>
                  </ul>
                </div>
                <Link to="/register" className="block w-full py-3 px-6 text-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">
                  Contact Us
                </Link>
              </motion.div>
            </motion.div>

            <div className="mt-12 text-center">
              <p className="text-xs md:text-sm text-zinc-500 font-light mb-1">All plans include a 14-day free trial. No credit card required.</p>
              <p className="text-xs md:text-sm text-zinc-500 font-light">Need a custom plan? <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">Contact us</a></p>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 pt-16 pb-8 relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <Link to="/" className="flex items-center gap-2 mb-4">
                  <img src={logo} alt="Snapceit" className="h-14 w-auto" />
                </Link>
                <p className="text-sm text-white/50 mb-6">Automating financial operations for modern businesses.</p>
                <div className="flex gap-4">
                  <a href="#" className="text-white/40 hover:text-white transition-colors">X</a>
                  <a href="#" className="text-white/40 hover:text-white transition-colors">GitHub</a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/40">© {new Date().getFullYear()} Snapceit Inc. All rights reserved.</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-white/60">Systems Operational</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
