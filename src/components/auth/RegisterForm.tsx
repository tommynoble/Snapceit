import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../auth/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

interface RegisterFormProps {
  onBack: () => void;
  heading?: string;
}

const getErrorMessage = (error: any) => {
  const message = error.message?.toLowerCase() || '';
  
  if (error.name === 'UsernameExistsException') {
    // Check if the user is unverified
    if (message.includes('not confirmed')) {
      return 'This email is registered but not verified. We\'ll send you a new verification code.';
    }
    return 'This email is already registered and verified. Please try logging in instead.';
  }
  
  // Handle Supabase specific error messages
  if (message.includes('already registered') || message.includes('user already exists')) {
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

export function RegisterForm({ onBack, heading = "Get started with Snapceit" }: RegisterFormProps) {
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
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting registration process...');
      console.log('Form data:', {
        email: formData.email,
        hasPassword: !!formData.password
      });

      const response = await signup(formData.email, formData.password);
      console.log('Registration response:', response);
      
      // Check if email confirmation is required
      if (response?.user && !response.user.confirmed_at) {
        setSuccessMessage('Registration successful! Please check your email for the verification link. Click the link in the email to verify your account.');
        // Clear the form after successful registration
        setFormData({
          email: '',
          password: '',
          confirmPassword: ''
        });
        // Don't navigate to verify-email page since Supabase uses magic links
        // User will be redirected after clicking the link in their email
      } else if (response?.user) {
        // User is already confirmed (shouldn't happen with default Supabase settings)
        setSuccessMessage('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.name === 'UsernameExistsException') {
        if (err.message.toLowerCase().includes('not confirmed')) {
          // If user exists but is not confirmed, resend the verification code
          try {
            await signup(formData.email, formData.password);
            setSuccessMessage('A new verification code has been sent to your email');
            setTimeout(() => {
              navigate('/verify-email', { 
                state: { 
                  email: formData.email,
                } 
              });
            }, 2000);
            return;
          } catch (resendError) {
            console.error('Error resending verification code:', resendError);
            setError('Failed to resend verification code. Please try again.');
          }
        } else {
          setError('This email is already registered and verified. Please try logging in instead.');
        }
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white/90 text-center mb-6">{heading}</h2>

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

            <form onSubmit={handleSubmit} className="space-y-4">
              {!successMessage ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                        placeholder="Create a password"
                        required
                        disabled={loading}
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

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                        placeholder="Confirm your password"
                        required
                        disabled={loading}
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
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                        loading
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
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
                  <div className="text-4xl mb-4">✓</div>
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
          </div>
        </motion.div>
      </div>
    </>
  );
}