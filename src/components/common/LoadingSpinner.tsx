import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const loadingMessages = [
  "Welcome to Snapceit! Let's organize your receipts ✨",
  "Preparing your AI-powered receipt scanner 🤖",
  "Getting your digital wallet ready 💼",
  "Setting up your smart expense tracking 📱",
  "Configuring your personalized dashboard 📊",
  "Initializing receipt recognition system 🔍",
  "Preparing your financial insights 💡",
  "Setting up smart categorization 🏷️",
  "Optimizing your expense tracking experience 💫",
  "Almost ready to revolutionize your receipts! 🚀",
  "Final touches on your financial command center 🎯",
  "Get ready to simplify your expense tracking 🌟"
];

const LoadingSpinner: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setCurrentMessage(loadingMessages[currentIndex]);
    }, 3500); // Change message every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 flex flex-col items-center justify-center z-50">
      <div className="text-center p-8 max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="w-24 h-24 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p 
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-2xl text-white font-medium mb-3"
          >
            {currentMessage}
          </motion.p>
          
          <p className="text-white/80 text-sm mt-4">
            Snapceit is preparing your personalized experience
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
