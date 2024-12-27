import React from 'react';
import { motion } from 'framer-motion';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`text-base sm:text-lg bg-white text-purple-700 px-8 py-3 rounded-md border-2 border-purple-700 hover:bg-purple-50 transition-colors font-semibold ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default SecondaryButton;
