import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../images/logo.svg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setIsOpen(false); // Close menu
    navigate(path); // Navigate to the path
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 }
  };

  return (
    <nav className="px-6 py-4 pt-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo on far left */}
        <Link to="/" className="text-white" onClick={() => setIsOpen(false)}>
          <img src={logo} alt="Logo" className="h-16 md:h-16 h-12 w-auto" />
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/capabilities" className="text-white hover:text-purple-100 transition-colors font-semibold">
            Capabilities
          </Link>
          <Link to="/product" className="text-white hover:text-purple-100 transition-colors font-semibold">
            Product
          </Link>
          <Link to="/action" className="text-white hover:text-purple-100 transition-colors font-semibold">
            Action
          </Link>
          <Link to="/pricing" className="text-white hover:text-purple-100 transition-colors font-semibold">
            Pricing
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <Link 
            to="/login" 
            className="text-white hover:text-purple-100 transition-colors p-1.5 rounded-md hover:bg-purple-600/20"
          >
            <User className="w-6 h-6" />
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation('/onboarding')}
            className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors font-semibold"
          >
            Start Free Trial
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2 hover:bg-purple-600/20 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="md:hidden mt-4 px-4 py-5 space-y-4 bg-purple-500/50 rounded-md backdrop-blur-sm"
          >
            <motion.div variants={itemVariants} className="mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation('/onboarding')}
                className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors font-semibold w-full text-center"
              >
                Start Free Trial
              </motion.button>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <button
                onClick={() => handleNavigation('/capabilities')}
                className="block w-full text-left text-white hover:text-purple-100 transition-colors font-semibold text-lg py-2"
              >
                Capabilities
              </button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                onClick={() => handleNavigation('/product')}
                className="block w-full text-left text-white hover:text-purple-100 transition-colors font-semibold text-lg py-2"
              >
                Product
              </button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                onClick={() => handleNavigation('/action')}
                className="block w-full text-left text-white hover:text-purple-100 transition-colors font-semibold text-lg py-2"
              >
                Action
              </button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                onClick={() => handleNavigation('/pricing')}
                className="block w-full text-left text-white hover:text-purple-100 transition-colors font-semibold text-lg py-2"
              >
                Pricing
              </button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                onClick={() => handleNavigation('/login')}
                className="block w-full text-left text-white hover:text-purple-100 transition-colors font-semibold text-lg py-2"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
