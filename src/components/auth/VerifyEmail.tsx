import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/CognitoAuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

export function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmSignUp, resendConfirmationCode } = useAuth();
  
  // Get both email and username from location state
  const email = location.state?.email;
  const username = location.state?.username;
  const phoneNumber = location.state?.phoneNumber;
  const deliveryMedium = location.state?.deliveryMedium || 'EMAIL';
  const destination = location.state?.destination;

  if (!username || !email) {
    console.error('Missing required state:', { username, email });
    navigate('/register');
    return null;
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    console.log('Verifying code...', { username });
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await confirmSignUp(username, verificationCode);
      console.log('Verification successful, redirecting to login...');
      setSuccessMessage('Email verified successfully! Redirecting to login...');
      
      // Short delay to show success message
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email,
            message: 'Email verified successfully! Please log in.' 
          } 
        });
      }, 1500);
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
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('Attempting to resend code for username:', username);
      const { deliveryMedium, destination } = await resendConfirmationCode(username);
      
      // Mask the email for privacy in the UI
      const maskedEmail = email.replace(/([^@]{3})[^@]+@/, '$1***@');
      setSuccessMessage(`Verification code resent to ${maskedEmail}`);
      console.log('Code resent successfully:', { deliveryMedium, destination: maskedEmail });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error resending code:', err);
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationMessage = () => {
    return `We sent a verification code to ${destination}`;
  };

  return (
    <>
      {loading && <LoadingSpinner />}
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
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/20 text-green-700">
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
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter verification code"
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <motion.button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                    loading || verificationCode.length !== 6
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
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full text-sm text-white/80 hover:text-white transition-colors py-2"
                >
                  Didn't receive the code? <span className="text-[#23cff4] border-b border-[#23cff4]">Resend it</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
