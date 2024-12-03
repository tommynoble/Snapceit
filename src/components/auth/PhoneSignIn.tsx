import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../firebase/AuthContext';
import { PhoneNumberInput } from './PhoneNumberInput';

interface PhoneSignInProps {
  onBackClick: () => void;
}

export const PhoneSignIn: React.FC<PhoneSignInProps> = ({ onBackClick }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const navigate = useNavigate();
  const { sendPhoneVerification, verifyPhoneCode } = useAuth();

  const handleSendCode = async () => {
    setError('');
    setLoading(true);

    try {
      // Ensure phone number is in E.164 format
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber.replace(/\D/g, '')}`;

      if (formattedNumber.length < 12) {
        throw new Error('Please enter a valid phone number');
      }

      const id = await sendPhoneVerification(formattedNumber);
      setVerificationId(id);
      setCodeSent(true);
      setError('');
    } catch (err: any) {
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to send verification code. Please try again.');
      }
      console.error('Phone verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await verifyPhoneCode(verificationId, verificationCode);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('Verification code has expired. Please request a new one.');
        setCodeSent(false);
      } else {
        setError('Failed to verify code. Please try again.');
      }
      console.error('Phone code verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {!codeSent ? 'Enter Your Phone Number' : 'Verify Code'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {!codeSent ? (
            <div>
              <label htmlFor="phone" className="sr-only">Phone Number</label>
              <PhoneNumberInput
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value)}
                placeholder="Enter your phone number"
              />
              <button
                onClick={handleSendCode}
                disabled={loading || !phoneNumber}
                className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          ) : (
            <div>
              <label htmlFor="verification-code" className="sr-only">Verification Code</label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                maxLength={6}
              />
              <button
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                onClick={() => {
                  setCodeSent(false);
                  setVerificationCode('');
                  setError('');
                }}
                className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-purple-600 hover:text-purple-700 focus:outline-none"
              >
                Change Phone Number
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col space-y-4">
          <button
            onClick={onBackClick}
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};
