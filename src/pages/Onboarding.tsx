import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
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
      // Temporarily store onboarding data in localStorage to persist across registration
      localStorage.setItem('temp_onboarding_data', JSON.stringify(data));

      if (currentUser) {
        // If already logged in, save to Supabase immediately
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
        // Redirect to dashboard if logged in
        navigate('/dashboard');
      } else {
        // If not logged in, go to register
        navigate('/register');
      }
    } catch (err) {
      console.error('Error in onboarding completion:', err);
      // Fallback
      navigate(currentUser ? '/dashboard' : '/register');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900">
      <Navbar />
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <motion.div
          className="flex-1 flex items-center justify-center pt-52 pb-32"
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
