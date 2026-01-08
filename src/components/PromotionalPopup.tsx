import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PromotionalPopupProps {
  delayMs?: number;
}

export function PromotionalPopup({ delayMs = 5000 }: PromotionalPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row">
              {/* Left side - Content */}
              <div className="flex-1 p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    Limited time:<br />Get started free
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
                  See how Snapceit helps you save time, reduce waste, and take control of your finances—then get started with our free plan.
                </p>

                <form className="space-y-3 mb-4">
                  <input
                    type="email"
                    placeholder="What's your email?"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#D444EF] via-[#AF3AEB] to-purple-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-shadow"
                  >
                    Get Started Free
                  </button>
                </form>

                <p className="text-xs text-gray-500">
                  <a href="#" className="underline hover:text-gray-700">Terms and Conditions</a> apply.
                </p>
              </div>

              {/* Right side - Visual */}
              <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 items-center justify-center p-8 relative overflow-hidden">
                <div className="text-center">
                  <div className="text-7xl font-bold text-white mb-4">Free</div>
                  <p className="text-white/80 text-lg">Start your journey today</p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-8 right-12 w-8 h-8 rounded-full border-2 border-white/30 opacity-60"></div>
                <div className="absolute bottom-16 left-12 w-6 h-6 rounded-full border-2 border-white/30 opacity-60"></div>
                <div className="absolute top-1/2 right-1/4 w-4 h-4 rounded-full bg-white/20 opacity-60"></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
