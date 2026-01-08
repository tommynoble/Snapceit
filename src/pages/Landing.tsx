import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Menu, X, User, ScanLine, Tag, RefreshCw, PieChart, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../images/logo.svg';
import '../styles/landing.css';
import { PromotionalPopup } from '../components/PromotionalPopup';
import { ChatWidget } from '../components/ChatWidget';

export function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featureSlide, setFeatureSlide] = useState(0);
  const [billingMode, setBillingMode] = useState<'monthly' | 'yearly'>('monthly');

  const navLinks = [
    { label: 'Solutions', href: '#action' },
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      setFeatureSlide((prev) => (prev + 1) % 3);
    }, 16000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Helmet>
        <title>Snapceit - AI Receipt Scanner & Tax Deduction Tool | Automate Expense Tracking</title>
        <meta name="description" content="Snapceit is an AI-powered receipt scanner that automates expense tracking and tax deductions. Digitize receipts instantly, categorize expenses, and maximize tax savings. Explore Solutions, Features, Testimonials, and Pricing." />
        <meta name="keywords" content="receipt scanner, AI receipt OCR, expense tracking software, tax deduction tool, automated receipt management, financial software, receipt digitizer, expense categorization, tax savings" />
        <meta name="author" content="Snapceit Inc." />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta property="og:title" content="Snapceit - AI Receipt Scanner & Tax Deduction Tool" />
        <meta property="og:description" content="Automate receipt scanning, expense tracking, and tax deductions with AI. Digitize receipts instantly and maximize your tax savings." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://snapceit.com/" />
        <meta property="og:site_name" content="Snapceit" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Snapceit - AI Receipt Scanner & Tax Deduction Tool" />
        <meta name="twitter:description" content="Automate receipt scanning and expense tracking with AI. Digitize receipts instantly." />
        <meta name="twitter:creator" content="@snapceit" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#D444EF" />
        <link rel="canonical" href="https://snapceit.com/" />
        <link rel="alternate" hrefLang="en" href="https://snapceit.com/" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Helmet>
      <div className="landing-bg landing-scrollbar min-h-screen text-white overflow-x-hidden relative">
      {/* Grid overlay */}
      <div className="bg-grid" />
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-fuchsia-500/30 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="fixed flex w-full z-50 pt-4 px-4 top-0 shadow-sm justify-center">
        <div className="glass flex md:w-auto md:gap-16 md:py-4 md:px-20 text-base w-full rounded-full py-3 px-6 relative shadow-md gap-4 items-center justify-between bg-black/10 backdrop-blur-md">
          <button onClick={handleLogoClick} className="flex items-center gap-2 group relative bg-none border-none cursor-pointer">
            <img src={logo} alt="Snapceit" className="h-14 w-auto" />
          </button>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-base font-semibold text-white/90 hover:text-white transition-colors cursor-pointer">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/20">
            <Link to="/login" className="transition-colors text-white/90 hover:text-white">
              <User size={20} />
            </Link>
            <Link
              to="/onboarding"
              className="bg-[#4c1d95] hover:bg-[#5b21b6] text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-purple-900/20"
            >
              Try for Free
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

      <main className="pt-32 relative">
        {/* Hero */}
        <section className="z-10 text-center max-w-4xl mx-auto mb-16 px-6 relative">
          <h1 className="z-20 font-manrope mt-20 md:mt-24 mb-6 relative perspective-1000 leading-tight">
            <span className="md:text-7xl text-5xl sm:text-6xl font-medium text-white tracking-tighter drop-shadow-sm block bg-gradient-to-t from-cyan-200 to-white bg-clip-text text-transparent">
              Say Goodbye to
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
              to="/onboarding"
              className="group flex gap-2 shiny-cta shadow-purple-900/30 text-sm md:text-lg font-semibold text-white h-12 md:h-14 rounded-lg px-6 md:px-10 relative shadow-xl items-center justify-center mb-[3px]"
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
            <div className="flex flex-col md:flex-row h-[580px] md:h-[720px] w-full bg-[#a855f7] font-sans overflow-y-scroll md:overflow-hidden">
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
                  <div className="bg-white rounded-xl p-3 md:p-5 shadow-lg border border-white/50">
                    <div className="flex justify-between items-start mb-1 md:mb-2">
                      <span className="text-[10px] md:text-xs font-semibold text-slate-500 font-sans tracking-wide">Tax Summary</span>
                      <div className="p-1 md:p-1.5 bg-blue-50 text-blue-500 rounded-md shadow-sm border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2 1-2 1Z" />
                          <path d="M14 8H8" />
                          <path d="M16 12H8" />
                          <path d="M13 16H8" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-lg md:text-2xl font-bold text-slate-900 mb-2 md:mb-5 font-manrope tracking-tight">$0.00</div>
                    <div className="space-y-1.5 md:space-y-2.5">
                      <div className="flex justify-between text-[9px] md:text-[11px] font-medium">
                        <span className="text-slate-400">Avg. Tax Rate</span> <span className="text-slate-900">0%</span>
                      </div>
                      <div className="flex justify-between text-[9px] md:text-[11px] font-medium">
                        <span className="text-slate-400">Est. Savings</span>
                        <span className="text-emerald-500">$0.00</span>
                      </div>
                      <div className="flex justify-between text-[9px] md:text-[11px] font-medium">
                        <span className="text-slate-400">Total Receipts</span>
                        <span className="text-slate-900">16</span>
                      </div>
                      <div className="flex justify-between text-[9px] md:text-[11px] font-medium">
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
          className="overflow-hidden md:pt-32 z-30 bg-white border-white/20 border-t pt-32 pb-32 relative shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)]"
          id="action"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="z-10 max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[195px] relative">
            <motion.div 
              className="max-w-2xl text-left mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-900 mb-8 backdrop-blur-md">
                Snapceit features suite
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight leading-tight mb-6">
                Automate your entire<br />financial workflow
              </h2>
              <p className="leading-relaxed text-sm sm:text-base md:text-lg text-slate-600">
                Scan receipts, categorize expenses, and sync to your accounting software automatically.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-full w-full mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <motion.div 
                className="group relative w-full h-[520px] bg-gradient-to-br from-[#E95AF5] to-[#991B9F] rounded-[2rem] overflow-hidden flex flex-col pt-10 px-8 shadow-lg transition-transform hover:scale-[1.01] duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="relative z-10 flex flex-col items-start gap-3 max-w-[90%]">
                  <h2 className="text-lg font-bold text-white tracking-tight font-manrope">Scan & Go</h2>
                  <p className="leading-snug text-base font-medium text-white/90">
                    Instantly extract merchant, date, and amount from any receipt with 99.9% accuracy.
                  </p>
                  <a href="#" className="mt-4 text-cyan-300 font-semibold text-base hover:text-white transition-colors flex items-center gap-1.5 group-hover:gap-2 duration-300">
                    Learn more
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </a>
                </div>
                
                <div className="absolute bottom-0 right-0 w-[85%] h-[60%] rounded-tl-3xl overflow-hidden shadow-2xl border-l-4 border-t-4 border-white/30 transition-transform duration-500 group-hover:translate-y-2">
                  <img src="/cards/scan.png" alt="Smart Scanning UI" className="w-full h-full object-cover opacity-100 hover:opacity-100 transition-opacity" style={{ position: 'absolute', bottom: 0, right: 0 }} />
                </div>
              </motion.div>

              <motion.div 
                className="group relative w-full h-[520px] bg-gradient-to-br from-[#E95AF5] to-[#991B9F] rounded-[2rem] overflow-hidden flex flex-col pt-10 px-8 shadow-lg transition-transform hover:scale-[1.01] duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="relative z-10 flex flex-col items-start gap-3 max-w-[90%]">
                  <h2 className="text-lg font-bold text-white tracking-tight font-manrope">Auto Categorization</h2>
                  <p className="leading-snug text-base font-medium text-white/90">
                    Intelligent AI learns your spending patterns and automatically categorizes expenses for you.
                  </p>
                  <a href="#" className="mt-4 text-cyan-300 font-semibold text-base hover:text-white transition-colors flex items-center gap-1.5 group-hover:gap-2 duration-300">
                    Learn more
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </a>
                </div>

                <div className="absolute bottom-0 right-0 w-[85%] h-[60%] rounded-tl-3xl overflow-hidden shadow-2xl border-l-4 border-t-4 border-white/30 transition-transform duration-500 group-hover:translate-y-2">
                  <img src="/cards/categorize.png" alt="Auto Categorization UI" className="w-full h-full object-cover opacity-100 hover:opacity-100 transition-opacity" style={{ position: 'absolute', bottom: 0, right: 0 }} />
                </div>
              </motion.div>

              <motion.div 
                className="group relative w-full h-[520px] bg-gradient-to-br from-[#E95AF5] to-[#991B9F] rounded-[2rem] overflow-hidden flex flex-col pt-10 px-8 shadow-lg transition-transform hover:scale-[1.01] duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="relative z-10 flex flex-col items-start gap-3 max-w-[90%]">
                  <h2 className="text-lg font-bold text-white tracking-tight font-manrope">Sync Anywhere</h2>
                  <p className="text-base text-white/90 font-medium leading-snug">
                    Seamlessly sync your reconciled financial data to your accounting platform in seconds.
                  </p>
                  <a href="#" className="mt-4 text-cyan-300 font-semibold text-base hover:text-white transition-colors flex items-center gap-1.5 group-hover:gap-2 duration-300">
                    Learn more
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>

                <div className="absolute bottom-0 right-0 w-[85%] h-[60%] rounded-tl-3xl overflow-hidden shadow-2xl border-l-4 border-t-4 border-white/30 transition-transform duration-500 group-hover:translate-y-2">
                  <img src="/cards/quickbooks.png" alt="QuickBooks Integration" className="w-full h-full object-cover opacity-100 hover:opacity-100 transition-opacity" style={{ position: 'absolute', bottom: 0, right: 0 }} />
                </div>
              </motion.div>

            </motion.div>
          </div>
        </motion.section>

        {/* Feature slider */}
        <section className="z-10 overflow-hidden md:pt-24 md:pb-24 pt-16 pb-16 relative" id="action">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
            <div className="overflow-hidden rounded-3xl relative backdrop-blur-2xl">
              <div className="md:py-12 max-w-7xl mx-auto md:pt-12 md:px-8 pt-8 px-4 md:pb-12 pb-8 relative">
                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                  <div className="flex flex-col justify-center min-h-[360px] relative order-2 md:order-1 md:-ml-8">
                    {[
                      {
                        badge: 'For Small Business',
                        title: 'Grow smarter, not harder',
                        copy: 'Save hours on receipt management. Focus on growing your business while our AI handles the details.',
                        tone: 'purple',
                      },
                      {
                        badge: 'For Everyone',
                        title: 'Easy to use, powerful results',
                        copy: 'Perfect for business owners, students, and freelancers. Manage receipts effortlessly.',
                        tone: 'blue',
                      },
                      {
                        badge: 'Built for Everyone',
                        title: 'Designed for businesses and people',
                        copy: 'Whether you\'re scaling a business or managing personal finances, Snapceit adapts to your needs.',
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
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight mb-6">
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

                    <div className="flex gap-4 mt-12 items-center justify-center md:justify-start">
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

                  <div className="relative h-full md:min-h-[480px] min-h-[300px] flex items-center order-1 md:order-2 md:-ml-12">
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
                            <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl h-full min-h-[310px] md:min-h-[490px] flex items-center justify-center border-4 border-purple-400/40 shadow-[0_0_60px_rgba(147,51,234,0.6)]">
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
          <div className="z-10 max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[195px] relative">
            <motion.div 
              className="max-w-2xl text-left mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-900 mb-8 backdrop-blur-md">
                Smart features suite
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight leading-tight mb-6">
                Smart Features That Work for You
              </h2>
              <p className="leading-relaxed text-sm sm:text-base md:text-lg text-slate-600">
                Everything you need to manage receipts effortlessly and stay organized.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true, margin: '-100px' }}
            >
            {/* Feature 1: Scan Receipts */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <div className="order-2 md:order-1 relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-violet-100 to-fuchsia-50 rounded-3xl -z-10 blur-xl opacity-70"></div>
                <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 p-6">
                  <div className="aspect-[4/3] bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute w-3/4 h-3/4 bg-white shadow-lg rounded-lg border border-slate-100 flex flex-col items-center p-6 relative z-10">
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-slate-100 mb-4"
                        animate={{ backgroundColor: ['rgb(226, 232, 240)', 'rgb(147, 112, 219)', 'rgb(226, 232, 240)'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      ></motion.div>
                      <motion.div 
                        className="w-2/3 h-4 bg-slate-100 rounded mb-2"
                        animate={{ backgroundColor: ['rgb(226, 232, 240)', 'rgb(147, 112, 219)', 'rgb(226, 232, 240)'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                      ></motion.div>
                      <motion.div 
                        className="w-1/2 h-4 bg-slate-100 rounded mb-8"
                        animate={{ backgroundColor: ['rgb(226, 232, 240)', 'rgb(147, 112, 219)', 'rgb(226, 232, 240)'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.4 }}
                      ></motion.div>
                      <motion.div 
                        className="w-full mt-auto h-12 bg-violet-600/10 rounded-lg border border-violet-100 flex items-center justify-center text-violet-600 font-medium text-sm"
                        animate={{ backgroundColor: ['rgba(109, 40, 217, 0.1)', 'rgba(109, 40, 217, 0.3)', 'rgba(109, 40, 217, 0.1)'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.6 }}
                      >Scanning...</motion.div>
                    </div>
                    <motion.div 
                      className="absolute w-full h-2 bg-gradient-to-b from-violet-400/80 to-transparent shadow-[0_0_20px_rgba(139,92,246,0.8)] z-20"
                      animate={{ top: ['-50px', 'calc(100% + 50px)'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    ></motion.div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">Scan receipts instantly.</h3>
                <p className="text-lg text-slate-500 mb-8 leading-relaxed">Our OCR technology is lightning fast. Simply take a photo and let our engine extract the vendor, date, total, and taxes in milliseconds.</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-slate-700">
                    <span style={{ color: '#af3aeb' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12l2 2l4-4"></path>
                      </svg>
                    </span>
                    99.9% data extraction accuracy
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <span style={{ color: '#af3aeb' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12l2 2l4-4"></path>
                      </svg>
                    </span>
                    Support for multi-page receipts
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <span style={{ color: '#af3aeb' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12l2 2l4-4"></path>
                      </svg>
                    </span>
                    Currency conversion included
                  </li>
                </ul>
                <a href="#" className="text-lg text-violet-600 font-semibold hover:text-violet-700 inline-flex items-center gap-2 group">
                  Learn more
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14m-7-7l7 7l-7 7"></path>
                  </svg>
                </a>
              </div>
            </motion.div>

            {/* Feature 2: Real-time Insights */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">Real-time insights.</h3>
                <p className="text-lg text-slate-500 mb-8 leading-relaxed">Visualize your spending habits. Get a clear view of where money is going with interactive charts and real-time budget tracking.</p>
                <a href="#" className="text-lg text-violet-600 font-semibold hover:text-violet-700 inline-flex items-center gap-2 group">
                  Explore analytics
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14m-7-7l7 7l-7 7"></path>
                  </svg>
                </a>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tl from-indigo-100 to-violet-50 rounded-3xl -z-10 blur-xl opacity-70"></div>
                <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 p-6">
                  <div className="aspect-[4/3] bg-slate-50 rounded-xl border border-slate-200 relative p-6 flex flex-col justify-end">
                    <div className="flex justify-between items-end h-full gap-4 px-4">
                      <motion.div 
                        className="w-full rounded-t-md relative group" 
                        style={{ backgroundColor: '#af3aeb', opacity: 0.4, alignSelf: 'flex-end' }}
                        initial={{ height: 0, opacity: 0 }}
                        whileInView={{ height: '40%', opacity: 0.4 }}
                        transition={{ duration: 0.8, delay: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$2k</div>
                      </motion.div>
                      <motion.div 
                        className="w-full rounded-t-md relative group" 
                        style={{ backgroundColor: '#af3aeb', opacity: 0.6, alignSelf: 'flex-end' }}
                        initial={{ height: 0, opacity: 0 }}
                        whileInView={{ height: '65%', opacity: 0.6 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true, margin: '-100px' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$4.5k</div>
                      </motion.div>
                      <motion.div 
                        className="w-full rounded-t-md relative group" 
                        style={{ backgroundColor: '#af3aeb', alignSelf: 'flex-end' }}
                        initial={{ height: 0, opacity: 0 }}
                        whileInView={{ height: '85%', opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true, margin: '-100px' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-100">$8.2k</div>
                      </motion.div>
                      <motion.div 
                        className="w-full rounded-t-md" 
                        style={{ backgroundColor: '#af3aeb', opacity: 0.6, alignSelf: 'flex-end' }}
                        initial={{ height: 0, opacity: 0 }}
                        whileInView={{ height: '55%', opacity: 0.6 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true, margin: '-100px' }}
                      ></motion.div>
                      <motion.div 
                        className="w-full rounded-t-md" 
                        style={{ backgroundColor: '#af3aeb', opacity: 0.4, alignSelf: 'flex-end' }}
                        initial={{ height: 0, opacity: 0 }}
                        whileInView={{ height: '45%', opacity: 0.4 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true, margin: '-100px' }}
                      ></motion.div>
                    </div>
                    <div className="h-px w-full bg-slate-200 mt-2"></div>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-tight mb-6">Businesses love Snapceit</h2>
              <p className="text-lg text-white/80 font-light">Trusted by thousands of businesses worldwide to streamline receipt management.</p>
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <div className="flex gap-6 pl-8 animate-scroll" style={{animation: 'scroll 20s linear infinite'}}>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-2 mb-4 rounded-lg px-3 py-2 w-fit">
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Streamlined Our Expense Tracking</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">Snapceit has completely transformed how we manage receipts. The OCR accuracy is outstanding and saves us hours every week.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">James Mitchell</p>
                    <p className="text-white/70 text-sm">Finance Manager</p>
                    <p className="text-white/70 text-sm">London, UK</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4 bg-white/5 rounded-lg">
                    <span className="text-white font-bold text-sm">JM</span>
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-2 mb-4 rounded-lg px-3 py-2 w-fit">
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Perfect for Our Accounting Team</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">The accuracy and speed are incredible. Our team now processes receipts 10x faster than before.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Ama Osei</p>
                    <p className="text-white/70 text-sm">Accounting Director</p>
                    <p className="text-white/70 text-sm">Accra, Ghana</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4 bg-white/5 rounded-lg">
                    <span className="text-white font-bold text-sm">AO</span>
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-2 mb-4 rounded-lg px-3 py-2 w-fit">
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Game Changer for Our Business</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">Snapceit is the best receipt management tool we've found. The mobile app is intuitive and incredibly reliable.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Sofia Rodriguez</p>
                    <p className="text-white/70 text-sm">Operations Manager</p>
                    <p className="text-white/70 text-sm">Madrid, Spain</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4 bg-white/5 rounded-lg">
                    <span className="text-white font-bold text-sm">SR</span>
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-2 mb-4 rounded-lg px-3 py-2 w-fit">
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Excellent Customer Service</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">The support team is fantastic and responsive. They helped us integrate everything seamlessly into our workflow.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">David Chen</p>
                    <p className="text-white/70 text-sm">Business Owner</p>
                    <p className="text-white/70 text-sm">Toronto, Canada</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4 bg-white/5 rounded-lg">
                    <span className="text-white font-bold text-sm">DC</span>
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-2 mb-4 rounded-lg px-3 py-2 w-fit">
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Invaluable for Tax Time</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">Having all our receipts organized and categorized makes tax season so much easier. Highly recommended!</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Priya Sharma</p>
                    <p className="text-white/70 text-sm">Freelance Consultant</p>
                    <p className="text-white/70 text-sm">Sydney, Australia</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4 bg-white/5 rounded-lg">
                    <span className="text-white font-bold text-sm">PS</span>
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-2 mb-4 rounded-lg px-3 py-2 w-fit">
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Transformed Our Receipt Management</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">This app has completely transformed how we handle receipts. The OCR accuracy is impressive!</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Sarah Johnson</p>
                    <p className="text-white/70 text-sm">CFO</p>
                    <p className="text-white/70 text-sm">Microsoft</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4 bg-white/5 rounded-lg">
                    <span className="text-white font-bold text-sm">MS</span>
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-2 mb-4 rounded-lg px-3 py-2 w-fit">
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Seamless QuickBooks Integration</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">Integration with QuickBooks was seamless. Saved us countless hours of manual data entry.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Michael Chen</p>
                    <p className="text-white/70 text-sm">Small Business Owner</p>
                    <p className="text-white/70 text-sm">Salesforce</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4 bg-white/5 rounded-lg">
                    <span className="text-white font-bold text-sm">SF</span>
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-2 mb-4 rounded-lg px-3 py-2 w-fit">
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Best Receipt Scanner</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">The best receipt scanner we've used. The mobile app is intuitive and fast.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">Emma Davis</p>
                    <p className="text-white/70 text-sm">Accounting Manager</p>
                    <p className="text-white/70 text-sm">Adobe</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4 bg-white/5 rounded-lg">
                    <span className="text-white font-bold text-sm">AD</span>
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-2 mb-4 rounded-lg px-3 py-2 w-fit">
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                  <span className="text-yellow-400 text-lg">☆</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-5 break-words">Exceptional Support</h3>
                <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">Customer support is exceptional. They helped us set up custom integrations quickly.</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex-1">
                    <p className="text-white font-semibold">James Wilson</p>
                    <p className="text-white/70 text-sm">Operations Director</p>
                    <p className="text-white/70 text-sm">Shopify</p>
                  </div>
                  <div className="relative h-16 w-16 flex items-center justify-center ml-4 bg-white/5 rounded-lg">
                    <span className="text-white font-bold text-sm">SH</span>
                  </div>
                </div>
              </div>
              <div className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-3xl p-8 flex flex-col">
                <div className="flex gap-1 mb-4">
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-500">★</span>
                </div>
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
          <div className="z-10 max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[195px] relative">
            <motion.div 
              className="max-w-2xl text-left mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-900 mb-8 backdrop-blur-md">
                Pricing suite
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight leading-tight mb-6">
                Pricing that grows
                <br />
                with you
              </h2>
              <p className="leading-relaxed text-sm sm:text-base md:text-lg text-slate-600">
                Start small, scale when your financial complexity grows. Every plan includes the AI extraction engine.
              </p>
            </motion.div>

            <div className="flex justify-end mb-14">
              <div className="inline-flex items-center rounded-full bg-zinc-300/30 backdrop-blur-xl px-1.5 py-1.5 text-sm">
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
                  className={`rounded-full px-8 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${billingMode === 'yearly' ? 'bg-orange-400/40 text-zinc-900 shadow-lg border border-orange-500/50' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Yearly
                  <span className="inline-flex items-center rounded-full bg-orange-400/40 px-3 py-1 text-[11px] font-bold text-orange-600 border border-orange-500/50">
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
                className="rounded-[32px] bg-white px-8 py-8 flex flex-col justify-between shadow-lg border-2 border-zinc-200 h-fit order-2 md:order-1"
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
                <Link to="/onboarding" className="block w-full py-3 px-6 text-center rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">
                  Get started
                </Link>
              </motion.div>

              <motion.div 
                className="flex flex-col transition-transform hover:scale-105 duration-300 bg-white z-10 rounded-[32px] px-8 py-10 relative shadow-lg ring-8 ring-purple-500 ring-opacity-50 justify-between order-1 md:order-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D444EF] via-[#AF3AEB] to-purple-700 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg tracking-wide uppercase">
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
                <Link to="/onboarding" className="group flex gap-2 shiny-cta shadow-purple-900/30 text-lg font-semibold text-white h-12 rounded-lg px-8 relative shadow-xl items-center justify-center w-full">
                  <span className="z-10 relative">Get started</span>
                </Link>
              </motion.div>

              <motion.div 
                className="rounded-[32px] bg-white outline outline-2 outline-zinc-200 px-8 py-8 flex flex-col justify-between shadow-lg h-fit order-3 md:order-3"
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
      <PromotionalPopup delayMs={5000} />
      <ChatWidget />
    </>
  );
}
