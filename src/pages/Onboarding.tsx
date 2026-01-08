import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Onboarding, OnboardingData } from '../components/onboarding/OnboardingQuestionnaire';
import { useAuth } from '../auth/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleComplete = async (data: OnboardingData) => {
    if (!currentUser) {
      navigate('/register');
      return;
    }

    try {
      // Save onboarding data to user_settings
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: currentUser.id,
          account_type: data.accountType,
          business_name: data.businessName,
          industry: data.industry,
          employee_count: data.employeeCount,
          personal_use_case: data.personalUseCase,
          monthly_receipts: data.monthlyReceipts,
          onboarding_completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving onboarding data:', error);
      }
    } catch (err) {
      console.error('Error saving onboarding data:', err);
    } finally {
      navigate('/register');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <Navbar />
        <motion.div 
          className="flex-1 flex items-center justify-center py-20 pb-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Onboarding onComplete={handleComplete} onBack={handleBack} />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default OnboardingPage;
