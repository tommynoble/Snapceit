import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, User } from 'lucide-react';

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

  const steps = [
    // Step 1: Account Type Selection
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-white text-center">Choose Account Type</h2>
      <p className="text-white/80 text-center">Select the type of account you want to create</p>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setFormData(prev => ({ ...prev, accountType: 'personal' }))}
          className={`flex flex-col items-center gap-4 rounded-xl p-6 text-center transition-all ${
            formData.accountType === 'personal'
              ? 'bg-white text-purple-600'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <User className="h-8 w-8" />
          <div>
            <div className="font-semibold">Personal</div>
            <div className="mt-1 text-sm opacity-80">
              Track personal expenses and receipts
            </div>
          </div>
        </button>

        <button
          onClick={() => setFormData(prev => ({ ...prev, accountType: 'business' }))}
          className={`flex flex-col items-center gap-4 rounded-xl p-6 text-center transition-all ${
            formData.accountType === 'business'
              ? 'bg-white text-purple-600'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Building2 className="h-8 w-8" />
          <div>
            <div className="font-semibold">Business</div>
            <div className="mt-1 text-sm opacity-80">
              Manage business expenses and invoices
            </div>
          </div>
        </button>
      </div>
    </motion.div>,

    // Step 2: Account Details
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-white text-center">
        {formData.accountType === 'business' ? 'Business Details' : 'Personal Details'}
      </h2>
      <p className="text-white/80 text-center">Tell us more about yourself</p>

      {formData.accountType === 'business' ? (
        <div className="space-y-4">
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Business Name"
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:outline-none focus:ring-0"
          />
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:outline-none focus:ring-0"
          >
            <option value="" disabled>Select Industry</option>
            <option value="retail">Retail</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="other">Other</option>
          </select>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            name="personalUseCase"
            value={formData.personalUseCase}
            onChange={handleChange}
            placeholder="How will you use Snapceit?"
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/60 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:outline-none focus:ring-0"
          />
        </div>
      )}
    </motion.div>,

    // Step 3: Usage Details
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-white text-center">Usage Details</h2>
      <p className="text-white/80 text-center">Help us customize your experience</p>

      <div className="space-y-4">
        {formData.accountType === 'business' && (
          <div>
            <label className="block text-sm font-medium text-white/80">Number of Employees</label>
            <select
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              <option value="">Select employee count</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201+">201+</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80">
            Estimated Monthly Receipts
          </label>
          <select
            name="monthlyReceipts"
            value={formData.monthlyReceipts}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
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
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex flex-col space-y-6">
        {steps[step]}
        
        <div className="flex justify-between space-x-4 mt-6">
          <button
            onClick={handleBack}
            className="px-6 py-2 text-white/80 hover:text-white transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 text-white/80 hover:text-white transition-colors"
          >
            {step === 2 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}