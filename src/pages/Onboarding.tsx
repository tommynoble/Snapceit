import React from 'react';
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
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navbar />
        </div>
      </div>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Onboarding onComplete={handleComplete} onBack={handleBack} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OnboardingPage;
