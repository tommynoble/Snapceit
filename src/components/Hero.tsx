import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../images/hero-image.png';
import heroPhoneImage from '../../images/hero-phone.png';
import BusinessReviewStats from './IDEStats';
import PrimaryButton from './ui/PrimaryButton';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="relative min-h-[100vh] flex flex-col justify-start text-center px-4 sm:px-6 -mt-4 overflow-hidden pb-20 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto pt-24 sm:pt-[7.5rem] relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-bold text-white mb-3 sm:mb-4 leading-tight text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem]"
          >
            Say Goodbye to<br className="block sm:hidden" /> Paper Receipts
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg lg:text-xl font-paragraph text-white max-w-2xl mx-auto mb-6 sm:mb-8"
          >
            Digitize, organize, and access your receipts effortlessly. Our AI-powered solution makes expense tracking simpler than ever.
          </motion.p>
          <div className="flex justify-center mb-4 sm:mb-6">
            <PrimaryButton onClick={() => navigate('/onboarding')}>
              Get Started
            </PrimaryButton>
          </div>
        </motion.div>

        <div className="w-full max-w-7xl mx-auto px-4 pr-8 absolute top-[42%] sm:top-[calc(38%-40px)] z-0">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full"
          >
            <img
              src={heroImage}
              alt="Dashboard Preview"
              className="hidden sm:block w-full h-auto rounded-xl"
            />
            <img
              src={heroPhoneImage}
              alt="Mobile Dashboard Preview"
              className="block sm:hidden w-full h-auto rounded-xl"
            />
          </motion.div>
        </div>
      </section>

      <section className="relative py-8 sm:py-12 px-4 sm:px-6">
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#D444EF]/5 via-[#AF3AEB]/5 to-transparent pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center relative py-8"
        >
          <h3 className="text-[20px] sm:text-[24px] font-medium text-white mb-8">
            Snapceit is loved by millions of businesses
          </h3>
          <BusinessReviewStats />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-white/50 mt-4 text-lg"
          >
            available in 5+ countries
          </motion.p>
        </motion.div>
      </section>
    </>
  );
};

export default Hero;
