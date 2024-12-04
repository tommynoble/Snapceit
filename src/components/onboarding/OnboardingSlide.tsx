import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingContent } from './OnboardingContent';

export const OnboardingSlide: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const totalSlides = 3;
  const autoPlayInterval = 5000; // 5 seconds

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-purple-800">
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Navigation Arrows */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 sm:px-8">
          <motion.button
            onClick={handlePrev}
            className="pointer-events-auto group rounded-full bg-white/10 p-2 sm:p-3 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8 transition-transform group-hover:-translate-x-1" />
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="pointer-events-auto group rounded-full bg-white/10 p-2 sm:p-3 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-4xl flex-1 flex items-center justify-center py-12 sm:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <OnboardingContent
                slide={currentSlide}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-4 px-4 sm:px-0 mb-16 sm:mb-20">
          <motion.button
            onClick={handleGetStarted}
            className="w-full rounded-lg bg-white px-8 py-3 text-lg font-semibold text-purple-600 shadow-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
          <motion.button
            onClick={handleLogin}
            className="w-full text-center text-white/80 hover:text-white py-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Already have an account? Sign in
          </motion.button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 transform gap-2">
          {[...Array(totalSlides)].map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/30'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};