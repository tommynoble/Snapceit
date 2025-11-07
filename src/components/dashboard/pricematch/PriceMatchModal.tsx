import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Tag, Store, CircleDollarSign, ShoppingCart, DollarSign, TrendingDown } from 'lucide-react';

interface PriceMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PriceMatch {
  store: string;
  price: number;
  savings: number;
  url: string;
}

export function PriceMatchModal({ isOpen, onClose }: PriceMatchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data - Replace with actual API call later
  const mockPriceMatches: PriceMatch[] = [
    {
      store: 'Amazon',
      price: 89.99,
      savings: 10.00,
      url: 'https://amazon.com'
    },
    {
      store: 'Walmart',
      price: 92.99,
      savings: 7.00,
      url: 'https://walmart.com'
    },
    {
      store: 'Target',
      price: 94.99,
      savings: 5.00,
      url: 'https://target.com'
    }
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    // TODO: Implement actual price matching API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm"
        >
          <div className="flex min-h-screen items-center justify-center px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-green-500 to-green-700 px-6 py-8 text-white">
                <button 
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full p-1 text-white/80 hover:bg-white/10"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                    <CircleDollarSign className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Price Match</h2>
                    <p className="text-white/80">Find the best deals for your purchases</p>
                  </div>
                </div>
              </div>

              {/* Search Section */}
              <div className="p-6">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter product name or scan receipt..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pl-10 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    {isLoading ? 'Searching...' : 'Search Deals'}
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Tag className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900">$99.99</h3>
                    <p className="text-sm text-gray-500">Original Price</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900">$89.99</h3>
                    <p className="text-sm text-gray-500">Best Price</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <TrendingDown className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-green-500">$10.00</h3>
                    <p className="text-sm text-gray-500">Potential Savings</p>
                  </div>
                </div>

                {/* Results */}
                <div className="mt-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Available Deals</h3>
                  <div className="space-y-3">
                    {mockPriceMatches.map((match, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <Store className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{match.store}</h4>
                            <p className="text-sm text-gray-500">Save ${match.savings.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-semibold text-gray-900">
                            ${match.price.toFixed(2)}
                          </p>
                          <a
                            href={match.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            View Deal
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                <p className="text-sm text-gray-500">
                  Prices and availability are subject to change. Savings shown are compared to original purchase price.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
