import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

interface RegisterFormProps {
  onBack: () => void;
  heading?: string;
}

const getErrorMessage = (error: any) => {
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.statusCode || '';
  
  console.log('Auth Error Details:', { message, status, error }); // Debug log
  
  if (error.name === 'UsernameExistsException') {
    // Check if the user is unverified
    if (message.includes('not confirmed')) {
      return 'This email is registered but not verified. We\'ll send you a new verification code.';
    }
    return 'This email is already registered and verified. Please try logging in instead.';
  }
  
  // Handle Supabase specific error messages
  if (message.includes('already registered') || message.includes('user already exists') || message.includes('duplicate')) {
    return 'This email has already been registered. Please try logging in instead.';
  }
  
  // Handle 422 status (Unprocessable Entity - usually duplicate email)
  if (status === 422 || message.includes('user_already_exists')) {
    return 'This email has already been registered. Please try logging in instead.';
  }
  
  if (message.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  
  if (message.includes('password')) {
    return 'Password must be at least 6 characters long.';
  }
  
  return error.message || 'An error occurred during registration. Please try again.';
};

export function RegisterForm({ onBack, heading = "Complete your registration" }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const { signup, confirmSignUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Pre-fill email from navigation state if available
    if (location.state?.email) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email
      }));
    }
  }, [location.state?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    console.log('handleSubmit called, cooldownSeconds:', cooldownSeconds);

    // Validate form first
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check cooldown BEFORE making any API calls
    if (cooldownSeconds > 0) {
      console.log('Cooldown active, blocking signup');
      setError(`For security purposes, you can only request this after ${cooldownSeconds} seconds.`);
      return;
    }

    console.log('Cooldown check passed, proceeding with signup');

    setLoading(true);

    try {
      console.log('Starting signup process...');
      console.log('Form data:', {
        email: formData.email,
        hasPassword: !!formData.password
      });

      const response = await signup(formData.email, formData.password);
      console.log('Registration response:', response);
      
      // Show OTP code input screen
      setSignupEmail(formData.email);
      setShowCodeInput(true);
      setError(''); // Clear any errors
      setSuccessMessage('We\'ve sent a 6-digit verification code to your email. Enter it below to verify your account.');
      
      // Start 60-second cooldown
      setCooldownSeconds(60);
      const interval = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Clear the form
      setFormData({
        email: '',
        password: '',
        confirmPassword: ''
      });
      setLoading(false);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // If it's a rate limit error (429), the OTP was still sent, so show the input screen
      if (err.status === 429 || err.message?.includes('after')) {
        setSignupEmail(formData.email);
        setShowCodeInput(true);
        setSuccessMessage('We\'ve sent a 6-digit verification code to your email. Enter it below to verify your account.');
        setCooldownSeconds(60);
        const interval = setInterval(() => {
          setCooldownSeconds(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(getErrorMessage(err));
      }
      
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!verificationCode.trim()) {
        setError('Please enter the verification code');
        setLoading(false);
        return;
      }

      // Verify the OTP code
      await confirmSignUp(signupEmail, verificationCode);
      
      setSuccessMessage('Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify code. Please try again.');
      setLoading(false);
    }
  };


  return (
    <>
      <Helmet>
        <title>Sign Up for Snapceit - Free Receipt Scanner</title>
        <meta name="description" content="Create your free Snapceit account to start scanning receipts, tracking expenses, and maximizing tax deductions with AI-powered receipt management." />
        <meta property="og:title" content="Sign Up for Snapceit" />
        <meta property="og:description" content="Create your free account to start scanning receipts and tracking expenses with Snapceit." />
        <link rel="canonical" href="https://snapceit.com/register" />
      </Helmet>
      {loading && <LoadingSpinner />}
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="backdrop-blur-sm rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2">
              {showCodeInput ? 'Verify Your Email' : heading}
            </h2>
            <p className="text-center text-white/70 mb-8 text-sm sm:text-base">
              {showCodeInput ? 'Enter the code we sent to your email' : 'Start managing your finances today.'}
            </p>

            {successMessage && (
              <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-lg text-sm sm:text-base">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            {showCodeInput ? (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm text-center tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-white/60 mt-2">Check your email for the 6-digit code</p>
                </div>

                <div className="space-y-3 pt-4">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                      loading
                        ? 'bg-purple-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeInput(false);
                      setVerificationCode('');
                      setSuccessMessage('');
                      setCooldownSeconds(0);
                    }}
                    className="w-full text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Back to Sign Up
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {!successMessage ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                        placeholder="Create a password"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      CONFIRM PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                        placeholder="Confirm your password"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>

                  <div className="space-y-3 pt-4">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-4 px-6 rounded-lg text-white font-semibold transition-all duration-200 ${
                        loading
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? 'Creating account...' : 'Continue'}
                    </motion.button>
                    
                    <div className="flex flex-col space-y-2 text-center">
                      <button
                        type="button"
                        onClick={onBack}
                        className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors group"
                      >
                        Already have an account? <span className="text-[#23cff4] group-hover:text-[#23cff4] border-b border-[#23cff4]">Sign in</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 text-center py-8">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#23cff4] to-[#597FFB] rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
                  <p className="text-white/80 mb-6">
                    We've sent a verification link to <span className="font-semibold text-white">{formData.email}</span>
                  </p>
                  <p className="text-sm text-white/60 mb-6">
                    Click the link in the email to verify your account and get started with Snapceit.
                  </p>
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-sm text-[#23cff4] hover:text-[#23cff4] transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}