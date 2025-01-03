import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../auth/CognitoAuthContext';
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
      // Login but don't navigate yet
      await login(formData.email, formData.password);
      
      // Show loading screen for longer (20 seconds)
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      // Then navigate with loading state to prevent auto-redirect
      navigate('/dashboard', { state: { loading: true } });
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

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }
    
    try {
      setError('');
      setSuccessMessage('');
      setIsLoading(true);
      await resetPassword(formData.email);
      setSuccessMessage('Password reset instructions sent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setError(getErrorMessage(err));
      console.error('[DEBUG] Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showLoading && <LoadingSpinner />}
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mx-auto"
        >
          <div className="backdrop-blur-sm rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white/90 text-center mb-6">Welcome Back!</h2>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                  placeholder="Enter your email"
                  required
                  disabled={showLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm pr-10"
                    placeholder="Enter your password"
                    required
                    disabled={showLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <motion.button
                  type="submit"
                  disabled={showLoading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
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
                    onClick={() => navigate('/register')}
                    className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors group"
                  >
                    Don't have an account? <span className="text-[#23cff4] group-hover:text-[#23cff4] border-b border-[#23cff4]">Sign up</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors group"
                  >
                    Forgot password? <span className="text-[#23cff4] group-hover:text-[#23cff4] border-b border-[#23cff4]">Send reset code</span>
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