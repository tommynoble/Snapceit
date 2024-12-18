import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../images/hero-image.png';
import heroPhoneImage from '../../images/hero-phone.png';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100vh] flex flex-col justify-start text-center px-4 sm:px-6 -mt-4 overflow-hidden pb-32 sm:pb-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto pt-32 sm:pt-36"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-normal leading-[1.15] sm:leading-[1.2]">
          Say Goodbye to Paper<br className="block sm:hidden" /> Receipts
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/80 mb-4 sm:mb-5 max-w-2xl mx-auto leading-relaxed">
          Digitize, organize, and access your receipts effortlessly. Our AI-powered solution makes expense tracking simpler than ever.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-2 sm:mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/onboarding')}
            className="text-base sm:text-lg bg-purple-700 text-white px-3 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-purple-600 transition-colors font-semibold w-32 mx-auto sm:w-auto sm:mx-0"
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>

      <div className="w-full max-w-7xl mx-auto px-4 pr-8 absolute top-[35%] sm:top-[40%]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full"
        >
          <img
            src={heroImage}
            alt="Dashboard Preview"
            className="hidden sm:block w-full h-auto rounded-xl shadow-2xl border border-white/10"
          />
          <img
            src={heroPhoneImage}
            alt="Mobile Dashboard Preview"
            className="block sm:hidden w-full h-auto rounded-xl shadow-2xl border border-white/10"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
