import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../auth/CognitoAuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface RegisterFormProps {
  onBack: () => void;
  heading?: string;
}

const getErrorMessage = (error: any) => {
  if (error.name === 'UsernameExistsException') {
    return 'An account with this email already exists. Please try logging in instead.';
  }
  return error.message || 'An error occurred during registration. Please try again.';
};

const isValidPhoneNumber = (phoneNumber: string) => {
  // Basic phone number validation using E.164 format
  // This regex allows for:
  // - Optional + at the start
  // - Country code (1-3 digits)
  // - Actual phone number (6-12 digits)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/\D/g, ''));
};

export function RegisterForm({ onBack, heading = "Get started with Snapceit" }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Starting registration process...');
      console.log('Form data:', {
        email: formData.email,
        name: formData.name,
        phone_number: formData.phoneNumber,
        hasPassword: !!formData.password
      });

      const { deliveryMedium, destination } = await signup(formData.email, formData.password, {
        name: formData.name,
        phone_number: formData.phoneNumber
      });
      
      console.log('Registration successful!', {
        deliveryMedium,
        destination: destination.replace(/[^@]+@/, '***@') // Mask email for privacy
      });
      
      navigate('/verify-email', { 
        state: { 
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          deliveryMedium,
          destination
        } 
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Add custom styles for the phone input to match our theme
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .PhoneInput {
        margin-top: 0.25rem;
      }
      .PhoneInputInput {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 0.875rem;
      }
      .PhoneInputInput::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
      .PhoneInputInput:focus {
        outline: none;
        ring: 2px;
        ring-color: rgba(255, 255, 255, 0.4);
        border-color: transparent;
      }
      .PhoneInputCountry {
        margin-right: 0.5rem;
      }
      .PhoneInputCountrySelect {
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 0.5rem;
        color: white;
        padding: 0.25rem;
      }
      .PhoneInputCountrySelect option {
        background-color: #1a1a1a;
        color: white;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-sm"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Phone Number (optional)
                </label>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="US"
                  value={formData.phoneNumber}
                  onChange={(value) => setFormData({ ...formData, phoneNumber: value || '' })}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-white/60">
                  Format: +1 (555) 123-4567 for US, or select your country code
                </p>
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
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}