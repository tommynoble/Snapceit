import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/SupabaseAuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

export function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmSignUp, resendConfirmationCode } = useAuth();
  
  // Get email from location state
  const email = location.state?.email;

  if (!email) {
    console.error('Missing email in state');
    navigate('/register');
    return null;
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    console.log('Verifying code...', { email });
    setError('');
    setSuccessMessage('');
    setShowLoading(true);

    try {
      await confirmSignUp(email, verificationCode);
      setSuccessMessage('Email verified successfully! Getting your dashboard ready...');
      
      // Show loading screen for 20 seconds
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      // Then navigate with loading state to prevent auto-redirect
      navigate('/dashboard', { state: { loading: true } });
    } catch (err: any) {
      console.error('Verification failed:', err);
      
      switch (err.name) {
        case 'CodeMismatchException':
          setError('Invalid code. Please check and try again.');
          break;
        case 'ExpiredCodeException':
          setError('Code has expired. Please click "Resend Code".');
          break;
        case 'UserNotFoundException':
          setError('User not found. Please register again.');
          break;
        default:
          setError(err.message || 'Failed to verify. Please try again.');
      }
      setShowLoading(false);
    }
  };

  const handleResendCode = async () => {
    setShowLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('Attempting to resend code for email:', email);
      await resendConfirmationCode(email);
      
      // Mask the email for privacy in the UI
      const maskedEmail = email.replace(/([^@]{3})[^@]+@/, '$1***@');
      setSuccessMessage(`Verification code resent to ${maskedEmail}`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error resending code:', err);
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setShowLoading(false);
    }
  };

  const getVerificationMessage = () => {
    // Mask the email for privacy in the UI
    const maskedEmail = email.replace(/([^@]{3})[^@]+@/, '$1***@');
    return `We sent a verification code to ${maskedEmail}`;
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white/90 text-center mb-2">
              Verify Your Email
            </h2>
            <p className="text-center text-white/70 mb-6">
              {getVerificationMessage()}
            </p>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-lg text-sm sm:text-base">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                  placeholder="Enter verification code"
                  required
                  disabled={showLoading}
                />
              </div>

              <div className="space-y-3 pt-2">
                <motion.button
                  type="submit"
                  disabled={showLoading || verificationCode.length !== 6}
                  className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                    showLoading || verificationCode.length !== 6
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  whileHover={{ scale: showLoading ? 1 : 1.02 }}
                  whileTap={{ scale: showLoading ? 1 : 0.98 }}
                >
                  {showLoading ? 'Verifying...' : 'Verify Code'}
                </motion.button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={showLoading}
                  className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors group"
                >
                  Didn't receive the code? <span className="text-[#23cff4] group-hover:text-[#23cff4] border-b border-[#23cff4]">Resend it</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
