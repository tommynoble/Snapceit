import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export function EmailConfirmed() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-purple-600 to-purple-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Email Confirmed!
        </h1>
        
        <p className="text-white/80 mb-6">
          Your email has been successfully verified. You can now log in to your account.
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="w-full py-3 px-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Go to Login
          </motion.button>

          <p className="text-white/60 text-sm">
            Redirecting to login in {countdown} seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
