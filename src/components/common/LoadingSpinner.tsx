import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  const loadingTexts = [
    "Setting up your workspace...",
    "Organizing your receipts...",
    "Creating your dashboard...",
    "Almost there...",
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 flex items-center justify-center z-50">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <motion.div
        className="relative flex flex-col items-center space-y-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated circles */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-white/10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-white/10"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div
              className="w-20 h-20 border-4 border-white/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 border-t-4 border-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        {/* Loading text animation */}
        <div className="h-8 flex items-center justify-center overflow-hidden">
          {loadingTexts.map((text, index) => (
            <motion.p
              key={text}
              className="absolute text-white text-lg font-medium text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{
                display: index === Math.floor((Date.now() / 2000) % loadingTexts.length) ? 'block' : 'none'
              }}
            >
              {text}
            </motion.p>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/50 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 8,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
