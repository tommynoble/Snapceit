import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center text-center px-4 sm:px-6 -mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-4xl mx-auto pt-6"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-normal leading-[1.15] sm:leading-[1.2]">
          Say Goodbye to Paper<br className="block sm:hidden" /> Receipts
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
          Digitize, organize, and access your receipts effortlessly. Our AI-powered solution makes expense tracking simpler than ever.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/onboarding')}
            className="text-base sm:text-lg bg-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-md hover:bg-purple-600 transition-colors font-semibold"
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/onboarding')}
            className="text-base sm:text-lg bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-md hover:bg-white/20 transition-colors font-semibold"
          >
            Learn More
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
