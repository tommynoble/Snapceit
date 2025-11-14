import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';
import quickbooksImage from '../../images/quickbooks.svg';
import budgetImage from '../../images/budget.png';

const QuickbooksSection = () => {
  const [activeTab, setActiveTab] = useState('pair');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="integrations" className="relative bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 py-16 overflow-hidden">
      {/* Background SVG Design - Simple circles in corners + gradient squares in middle */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradient for squares */}
          <linearGradient id="squareGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="squareGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Net-like pattern with white outlines in the middle - Larger with more boxes */}
        {/* Horizontal lines */}
        <line x1="200" y1="100" x2="1000" y2="100" stroke="white" strokeWidth="2" opacity="0.4" />
        <line x1="200" y1="180" x2="1000" y2="180" stroke="white" strokeWidth="2" opacity="0.35" />
        <line x1="200" y1="260" x2="1000" y2="260" stroke="white" strokeWidth="2" opacity="0.3" />
        <line x1="200" y1="340" x2="1000" y2="340" stroke="white" strokeWidth="2" opacity="0.3" />
        <line x1="200" y1="420" x2="1000" y2="420" stroke="white" strokeWidth="2" opacity="0.25" />
        <line x1="200" y1="500" x2="1000" y2="500" stroke="white" strokeWidth="2" opacity="0.2" />
        
        {/* Vertical lines */}
        <line x1="250" y1="100" x2="250" y2="500" stroke="white" strokeWidth="2" opacity="0.4" />
        <line x1="350" y1="100" x2="350" y2="500" stroke="white" strokeWidth="2" opacity="0.35" />
        <line x1="450" y1="100" x2="450" y2="500" stroke="white" strokeWidth="2" opacity="0.3" />
        <line x1="550" y1="100" x2="550" y2="500" stroke="white" strokeWidth="2" opacity="0.3" />
        <line x1="650" y1="100" x2="650" y2="500" stroke="white" strokeWidth="2" opacity="0.3" />
        <line x1="750" y1="100" x2="750" y2="500" stroke="white" strokeWidth="2" opacity="0.3" />
        <line x1="850" y1="100" x2="850" y2="500" stroke="white" strokeWidth="2" opacity="0.25" />
        <line x1="950" y1="100" x2="950" y2="500" stroke="white" strokeWidth="2" opacity="0.2" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Dynamic Content Section */}
        <div className="min-h-[800px] relative">
          {activeTab === 'pair' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {/* Image */}
              <div className="w-full max-w-3xl mx-auto mb-16 mt-12">
                <img
                  src={quickbooksImage}
                  alt="Quickbooks Integration"
                  className="w-full h-auto scale-95"
                />
              </div>

              {/* Text Section */}
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                  Pair with Quickbooks
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-2">
                  Seamlessly integrate with QuickBooks to streamline your financial workflow. Automatically sync receipts, track expenses.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {/* Budget Image */}
              <div className="w-full max-w-3xl mx-auto mb-16 mt-12">
                <img
                  src={budgetImage}
                  alt="Budget Analytics"
                  className="w-full h-auto scale-95"
                />
              </div>

              {/* Budget Text Section */}
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                  Smart Budget Analytics
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-2">
                  Track your spending patterns and optimize your budget with powerful analytics. Get insights and recommendations based on your financial data.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'taxes' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {/* Taxes Image */}
              <div className="w-full max-w-3xl mx-auto mb-16 mt-12">
                <img
                  src={budgetImage}
                  alt="Tax Deductibility"
                  className="w-full h-auto scale-95"
                />
              </div>

              {/* Taxes Text Section */}
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                  Tax Deductibility Made Easy
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-2">
                  Automatically categorize receipts and identify tax-deductible expenses. Simplify tax preparation and maximize your deductions.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'smart' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {/* Smart Image */}
              <div className="w-full max-w-3xl mx-auto mb-16 mt-12">
                <img
                  src={budgetImage}
                  alt="Smart Insights"
                  className="w-full h-auto scale-95"
                />
              </div>

              {/* Smart Text Section */}
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
                  AI-Powered Smart Insights
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-2">
                  Get intelligent recommendations and insights powered by advanced AI. Understand your spending habits and make smarter financial decisions.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Feature Buttons - Enhanced Slider */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="flex justify-center gap-3 bg-white/5 backdrop-blur-md p-2 rounded-full inline-flex mx-auto w-full justify-center">
            <motion.button 
              onClick={() => setActiveTab('pair')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'pair'
                  ? 'bg-white text-purple-600 shadow-xl'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Pair
            </motion.button>
            <motion.button 
              onClick={() => setActiveTab('budget')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'budget'
                  ? 'bg-white text-purple-600 shadow-xl'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Budget
            </motion.button>
            <motion.button 
              onClick={() => setActiveTab('taxes')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'taxes'
                  ? 'bg-white text-purple-600 shadow-xl'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Taxes
            </motion.button>
            <motion.button 
              onClick={() => setActiveTab('smart')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'smart'
                  ? 'bg-white text-purple-600 shadow-xl'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Smart
            </motion.button>
          </div>
        </div>
      </div>

      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large central blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <div className="absolute inset-0 bg-purple-600/10 rounded-full blur-3xl animate-random-2"></div>
        </div>
        
        {/* Floating blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72">
          <div className="absolute inset-0 bg-pink-500/15 rounded-full blur-2xl animate-random-1 animation-delay-1000"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl animate-random-3 animation-delay-3000"></div>
        </div>
        
        {/* Moving accent blobs */}
        <div className="absolute top-1/3 right-1/3 w-64 h-64">
          <div className="absolute inset-0 bg-purple-300/15 rounded-full blur-2xl animate-random-2 animation-delay-5000"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48">
          <div className="absolute inset-0 bg-pink-400/15 rounded-full blur-2xl animate-random-1 animation-delay-2000"></div>
        </div>
        
        {/* Additional random blobs */}
        <div className="absolute top-1/4 right-1/2 w-40 h-40">
          <div className="absolute inset-0 bg-indigo-400/10 rounded-full blur-xl animate-random-3 animation-delay-4000"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/2 w-56 h-56">
          <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl animate-random-2 animation-delay-3000"></div>
        </div>
      </div>

      {/* Modal/Lightbox */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-60"
              >
                <X size={32} />
              </button>

              {/* Modal Content */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                {activeTab === 'pair' && (
                  <img
                    src={quickbooksImage}
                    alt="Quickbooks Integration - Full View"
                    className="w-full h-auto"
                  />
                )}
                {activeTab === 'budget' && (
                  <img
                    src={budgetImage}
                    alt="Budget Analytics - Full View"
                    className="w-full h-auto"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default QuickbooksSection;
