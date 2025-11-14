import { motion } from 'framer-motion';
import { useState } from 'react';
import quickbooksImage from '../../images/quickbooks.svg';
import budgetImage from '../../images/budget.png';

const QuickbooksSection = () => {
  const [activeTab, setActiveTab] = useState('pair');

  return (
    <section className="relative bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 py-16 overflow-hidden">
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
              <div className="w-full max-w-3xl mx-auto mb-16">
                <img
                  src={quickbooksImage}
                  alt="Quickbooks Integration"
                  className="w-full h-auto scale-105"
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
              <div className="w-full max-w-3xl mx-auto mb-16">
                <img
                  src={budgetImage}
                  alt="Budget Analytics"
                  className="w-full h-auto scale-105"
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
        </div>

        {/* Feature Buttons */}
        <div className="max-w-3xl mx-auto mt-4">
          <div className="flex justify-center gap-2">
            <button 
              onClick={() => setActiveTab('pair')}
              className={`px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'pair'
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              Pair
            </button>
            <button 
              onClick={() => setActiveTab('budget')}
              className={`px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'budget'
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              Budget
            </button>
            <button 
              onClick={() => setActiveTab('taxes')}
              className={`px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'taxes'
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              Taxes
            </button>
            <button 
              onClick={() => setActiveTab('smart')}
              className={`px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === 'smart'
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              Smart
            </button>
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
    </section>
  );
};

export default QuickbooksSection;
