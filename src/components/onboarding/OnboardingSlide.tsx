import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { OnboardingContent } from './OnboardingContent';

export const OnboardingSlide: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const totalSlides = 3;

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-purple-800">
      <div className="relative flex min-h-screen flex-col items-center justify-between px-6 py-12">
        <div className="absolute left-4 right-4 top-1/2 flex -translate-y-1/2 transform justify-between">
          <motion.button
            onClick={handlePrev}
            className="group rounded-full bg-white/10 p-3 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-0 disabled:pointer-events-none"
            disabled={currentSlide === 0}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="h-8 w-8 transition-transform group-hover:-translate-x-1" />
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="group rounded-full bg-white/10 p-3 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-0 disabled:pointer-events-none"
            disabled={currentSlide === totalSlides - 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        <div className="z-10 flex w-full flex-1 flex-col items-center justify-center">
          <OnboardingContent 
            slide={currentSlide}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>

        <div className="flex gap-3 mt-8">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <motion.div
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                i === currentSlide 
                  ? 'bg-white scale-125 shadow-lg shadow-white/20' 
                  : 'bg-white/30 hover:bg-white/50 cursor-pointer'
              }`}
              onClick={() => i < currentSlide ? handlePrev() : handleNext()}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {currentSlide === totalSlides - 1 && (
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleGetStarted}
              className="rounded-full bg-white/10 px-6 py-3 text-white font-medium backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Get Started
            </button>
            <button
              onClick={handleLogin}
              className="rounded-full bg-white/10 px-6 py-3 text-white font-medium backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};