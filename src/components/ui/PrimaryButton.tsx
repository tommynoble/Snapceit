import React from 'react';
import { motion } from 'framer-motion';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`text-base sm:text-lg bg-purple-700 text-white px-6 py-3 rounded-md hover:bg-purple-600 transition-colors font-semibold w-fit ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default PrimaryButton;
