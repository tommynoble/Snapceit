import React from 'react';
import { motion } from 'framer-motion';

interface TertiaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const TertiaryButton: React.FC<TertiaryButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`text-base sm:text-lg bg-[#d444ef87] text-white px-8 py-3 rounded-md hover:bg-[#d444efaa] transition-colors font-semibold ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default TertiaryButton;
