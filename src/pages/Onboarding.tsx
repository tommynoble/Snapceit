import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
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
    <AuthLayout>
      <Onboarding onComplete={handleComplete} onBack={handleBack} />
    </AuthLayout>
  );
};

export default OnboardingPage;
