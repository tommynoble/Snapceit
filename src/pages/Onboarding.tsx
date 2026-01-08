import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Onboarding } from '../components/onboarding/OnboardingQuestionnaire';

const OnboardingPage = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <Onboarding onComplete={handleComplete} onBack={handleBack} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OnboardingPage;
