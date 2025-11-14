import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const getErrorMessage = (error: any) => {
  if (error.message) {
    if (error.message.includes('User does not exist')) {
      return 'No account found with this email. Please check your email or sign up.';
    }
    return error.message;
  }
  return 'We encountered an issue. Please try again.';
};

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      setSuccessMessage(`Password reset instructions sent to ${email}! Check your inbox and spam folder.`);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mx-auto"
        >
          <div className="backdrop-blur-sm rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white/90 text-center mb-2">Reset Password</h2>
            <p className="text-center text-white/60 text-sm sm:text-base mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3 pt-2">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                    isLoading
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>

                <div className="flex flex-col space-y-2 text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors group"
                  >
                    Remember your password? <span className="text-[#23cff4] group-hover:text-[#23cff4] border-b border-[#23cff4]">Sign in</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
  );
}
