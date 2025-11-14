import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/SupabaseAuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if user has a valid session (came from reset email)
    const checkSession = async () => {
      try {
        // First check if there's a session from the redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setSessionError('Session error: ' + sessionError.message);
          setHasValidSession(false);
          return;
        }

        if (session) {
          // Session exists, we're good to go
          setHasValidSession(true);
          setSessionError('');
          return;
        }

        // No session - check if we have a recovery token in the URL
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) {
          // The session should be established from the URL hash
          // Try again after a short delay to let Supabase process it
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: { session: newSession }, error: retryError } = await supabase.auth.getSession();
          
          if (retryError || !newSession) {
            setSessionError('Recovery link may have expired. Please request a new password reset.');
            setHasValidSession(false);
            return;
          }
          
          setHasValidSession(true);
          setSessionError('');
          return;
        }

        // No session and no recovery token
        setSessionError('No valid session. The reset link may have expired. Please request a new password reset.');
        setHasValidSession(false);
      } catch (err: any) {
        setSessionError('Error checking session: ' + err.message);
        setHasValidSession(false);
      }
    };
    
    checkSession();
  }, []);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      
      // Try to update password with current session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        // If no session, try using the recovery token approach
        if (updateError.message.includes('session')) {
          setError('Session expired. Please request a new password reset link.');
          setSessionError('Session expired. Please request a new password reset link.');
          setHasValidSession(false);
          return;
        }
        throw updateError;
      }

      setIsSuccess(true);
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      
      // Sign out the user first to clear any session
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white/90 text-center mb-2">
              Reset Your Password
            </h2>
            <p className="text-center text-white/60 mb-6 text-sm sm:text-base">
              Enter a new password to regain access to your account
            </p>

            {sessionError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm sm:text-base" role="alert">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={20} />
                  <span className="font-semibold">Session Error</span>
                </div>
                <span className="block sm:inline">{sessionError}</span>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="mt-3 text-xs sm:text-sm text-red-200 hover:text-red-100 underline"
                >
                  Request a new password reset
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm sm:text-base" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-lg text-sm sm:text-base flex items-center gap-2" role="alert">
                <CheckCircle size={20} />
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}

            {!isSuccess && hasValidSession ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm pr-10"
                      placeholder="Enter new password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    At least 8 characters, 1 uppercase, 1 lowercase, 1 number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm pr-10"
                      placeholder="Confirm new password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full text-xs sm:text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Back to <span className="text-[#23cff4] border-b border-[#23cff4]">Login</span>
                  </button>
                </div>
              </form>
            ) : isSuccess ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
                <p className="text-white/80 mb-4">Password reset successfully!</p>
                <p className="text-white/60 text-sm">Redirecting to login...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">Loading...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
  );
}
