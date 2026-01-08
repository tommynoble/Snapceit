import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

export function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    accountType: '',
    businessName: '',
    industry: '',
    employeeCount: '',
    personalUseCase: '',
    monthlyReceipts: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNext = () => {
    if (step === 0 && !formData.accountType) return;
    if (step === 1) {
      if (formData.accountType === 'business' && (!formData.businessName || !formData.industry)) return;
      if (formData.accountType === 'personal' && !formData.personalUseCase) return;
    }
    if (step < 2) {
      setStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const ProgressIndicator = () => (
    <div className="flex justify-center space-x-2 mb-8">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`h-2 rounded-full ${
            index === step
              ? 'bg-white w-8'
              : index < step
              ? 'bg-purple-400 w-8'
              : 'bg-white/20 w-4'
          } transition-all duration-300`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        />
      ))}
    </div>
  );

  const steps = [
    // Step 1: Account Type Selection
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Choose Account Type</h2>
        <p className="text-white/80">Select the type of account you want to create</p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFormData(prev => ({ ...prev, accountType: 'personal' }))}
          className={`flex flex-col items-center gap-4 rounded-xl p-8 text-center transition-all ${
            formData.accountType === 'personal'
              ? 'bg-white text-purple-600 shadow-lg'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <User className="h-10 w-10" />
          <div>
            <div className="font-semibold text-lg">Personal</div>
            <div className="mt-2 text-sm opacity-80">
              Track personal expenses and receipts
            </div>
          </div>
          {formData.accountType === 'personal' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4"
            >
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
            </motion.div>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFormData(prev => ({ ...prev, accountType: 'business' }))}
          className={`flex flex-col items-center gap-4 rounded-xl p-8 text-center transition-all ${
            formData.accountType === 'business'
              ? 'bg-white text-purple-600 shadow-lg'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Building2 className="h-10 w-10" />
          <div>
            <div className="font-semibold text-lg">Business</div>
            <div className="mt-2 text-sm opacity-80">
              Manage business expenses and invoices
            </div>
          </div>
          {formData.accountType === 'business' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4"
            >
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
            </motion.div>
          )}
        </motion.button>
      </div>
    </motion.div>,

    // Step 2: Account Details
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">
          {formData.accountType === 'business' ? 'Business Details' : 'Personal Details'}
        </h2>
        <p className="text-white/80">Tell us more about yourself</p>
      </div>

      {formData.accountType === 'business' ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Enter your business name"
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Industry</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="" disabled>Select your industry</option>
              <option value="retail">Retail</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Usage Purpose</label>
            <input
              type="text"
              name="personalUseCase"
              value={formData.personalUseCase}
              onChange={handleChange}
              placeholder="How will you use Snapceit?"
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>
      )}
    </motion.div>,

    // Step 3: Usage Details
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Usage Details</h2>
        <p className="text-white/80">Help us customize your experience</p>
      </div>

      <div className="space-y-6">
        {formData.accountType === 'business' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Number of Employees</label>
            <select
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Select employee count</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201+">201+</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">
            Estimated Monthly Receipts
          </label>
          <select
            name="monthlyReceipts"
            value={formData.monthlyReceipts}
            onChange={handleChange}
            className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">Select monthly volume</option>
            <option value="1-10">1-10 receipts</option>
            <option value="11-50">11-50 receipts</option>
            <option value="51-200">51-200 receipts</option>
            <option value="201+">201+ receipts</option>
          </select>
        </div>
      </div>
    </motion.div>
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center py-4">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl mx-auto px-6 py-4">
            <AnimatePresence mode="wait">
              <div className="flex flex-col space-y-8">
                <ProgressIndicator />
                {steps[step]}
                
                <div className="flex justify-between items-center pt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-2.5 text-white hover:bg-white/10 rounded-md transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-2.5 bg-purple-700 text-white rounded-md hover:bg-purple-600 transition-colors"
                  >
                    {step === 2 ? 'Complete' : 'Next'}
                    {step !== 2 && <ChevronRight className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}