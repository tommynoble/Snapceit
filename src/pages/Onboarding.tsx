import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Onboarding } from '../components/onboarding/OnboardingQuestionnaire';

const OnboardingPage = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/register');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Navbar />
        </motion.div>
        <motion.div 
          className="flex-1 flex items-center justify-center py-20 pb-32"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Onboarding onComplete={handleComplete} onBack={handleBack} />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Footer />
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
