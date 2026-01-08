import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const getErrorMessage = (error: any) => {
  if (error.message) {
    if (error.message.includes('User does not exist')) {
      return 'No account found with this email. Please check your email or sign up.';
    }
    if (error.message.includes('Incorrect username or password')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error.message.includes('User is not confirmed')) {
      return 'Please verify your email first.';
    }
    if (error.message.includes('Network error')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('Password attempts exceeded')) {
      return 'Too many failed attempts. Please try again later or reset your password.';
    }
    return error.message;
  }
  return 'We encountered an issue signing you in. Please try again.';
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email
      }));
    }
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setShowLoading(true);

    try {
      await login(formData.email, formData.password);
      const fromPath = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.name === 'UnverifiedUserError') {
        // Show success message and redirect to verification
        setSuccessMessage(err.message);
        setTimeout(() => {
          navigate('/verify-email', { 
            state: { 
              email: err.email,
            } 
          });
        }, 2000);
        return;
      }
      
      setError(err.message || 'Failed to login. Please try again.');
      setShowLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleResetPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <>
      <Helmet>
        <title>Login to Snapceit - Receipt Scanner</title>
        <meta name="description" content="Sign in to your Snapceit account to access your receipt scanner and expense tracking dashboard." />
        <meta property="og:title" content="Login to Snapceit" />
        <meta property="og:description" content="Sign in to your Snapceit account to manage your receipts and track expenses." />
        <link rel="canonical" href="https://snapceit.com/login" />
      </Helmet>
      {showLoading && <LoadingSpinner />}
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="backdrop-blur-sm rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2">Welcome Back!</h2>
            <p className="text-center text-white/70 mb-8 text-sm sm:text-base">Sign in to your account</p>
            <div className="flex flex-col items-center mb-2 sm:mb-4">
              {/* <img 
                src="/images/logo.svg" 
                alt="Snapceit Logo" 
                className="w-32 h-32 sm:w-40 sm:h-40 mb-1"
              /> */}
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm sm:text-base" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-lg text-sm sm:text-base" role="alert">
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                  placeholder="Enter your email"
                  required
                  disabled={showLoading}
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                    placeholder="Enter your password"
                    required
                    disabled={showLoading}
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

              <div className="space-y-3 pt-4">
                <motion.button
                  type="submit"
                  disabled={showLoading}
                  className={`w-full py-4 px-6 rounded-lg text-white font-semibold transition-all duration-200 ${
                    showLoading
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  whileHover={{ scale: showLoading ? 1 : 1.02 }}
                  whileTap={{ scale: showLoading ? 1 : 0.98 }}
                >
                  {showLoading ? 'Signing in...' : 'Sign in'}
                </motion.button>
                
                <div className="flex flex-col space-y-2 text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/onboarding')}
                    className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors group"
                  >
                    Don't have an account? <span className="text-[#23cff4] group-hover:text-[#23cff4] border-b border-[#23cff4]">Sign up</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors group"
                  >
                    Forgot password? <span className="text-[#23cff4] group-hover:text-[#23cff4] border-b border-[#23cff4]">Reset it here</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
