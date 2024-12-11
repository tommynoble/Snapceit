import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Onboarding onComplete={handleComplete} onBack={handleBack} />
      </div>
    </div>
  );
};

export default OnboardingPage;
