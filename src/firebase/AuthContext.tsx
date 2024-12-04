import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, webClientId } from './config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPhoneVerification: (phoneNumber: string) => Promise<string>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<string | null>(null);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
  const COOLDOWN_PERIOD = 60000; // 1 minute cooldown

  const clearRecaptcha = () => {
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }

      // Remove the old container if it exists
      if (recaptchaContainerRef.current) {
        const oldContainer = document.getElementById(recaptchaContainerRef.current);
        if (oldContainer) {
          oldContainer.remove();
        }
        recaptchaContainerRef.current = null;
      }

      // Clean up any leftover reCAPTCHA iframes
      const iframes = document.querySelectorAll('iframe[src*="recaptcha"]');
      iframes.forEach(iframe => iframe.remove());

      // Remove any existing reCAPTCHA badges
      const badges = document.querySelectorAll('.grecaptcha-badge');
      badges.forEach(badge => badge.remove());
    } catch (error) {
      console.error('Error clearing reCAPTCHA:', error);
    }
  };

  const createRecaptchaContainer = () => {
    // Generate a unique ID for the container
    const containerId = `recaptcha-container-${Date.now()}`;
    recaptchaContainerRef.current = containerId;

    // Create a new container
    const container = document.createElement('div');
    container.id = containerId;
    container.style.display = 'none';
    document.body.appendChild(container);

    return containerId;
  };

  const setupRecaptcha = () => {
    clearRecaptcha();
    const containerId = createRecaptchaContainer();

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('Recaptcha verified:', response);
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        clearRecaptcha();
      }
    });

    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({
      client_id: webClientId,
      prompt: 'select_account'
    });
    await signInWithPopup(auth, provider);
  };

  const sendPhoneVerification = async (phoneNumber: string) => {
    try {
      // Check cooldown period
      const currentTime = Date.now();
      if (currentTime - lastAttemptTime < COOLDOWN_PERIOD) {
        const remainingTime = Math.ceil((COOLDOWN_PERIOD - (currentTime - lastAttemptTime)) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before trying again`);
      }

      // Format phone number if needed
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber.replace(/\D/g, '')}`;

      if (formattedNumber.length < 12) {
        throw new Error('Please enter a valid phone number with country code');
      }

      const recaptchaVerifier = setupRecaptcha();
      
      // Attempt to verify reCAPTCHA
      try {
        await recaptchaVerifier.verify();
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification failed:', recaptchaError);
        throw new Error('reCAPTCHA verification failed');
      }

      // Request verification code
      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier);
      
      // Update last attempt time only on successful send
      setLastAttemptTime(currentTime);
      
      console.log('SMS sent successfully');
      return confirmationResult.verificationId;
    } catch (error: any) {
      clearRecaptcha();
      console.error('Phone verification error:', error);

      // Handle specific error cases
      switch (error.code) {
        case 'auth/invalid-phone-number':
          throw new Error('Invalid phone number format. Please include country code (e.g., +1)');
        case 'auth/too-many-requests':
          setLastAttemptTime(Date.now()); // Force cooldown on rate limit
          throw new Error('Too many attempts. Please wait 1 minute before trying again.');
        case 'auth/operation-not-allowed':
          throw new Error('Phone authentication is not enabled. Please contact support.');
        default:
          throw new Error(error.message || 'Failed to send verification code');
      }
    }
  };

  const verifyPhoneCode = async (verificationId: string, code: string) => {
    try {
      if (!code || code.length !== 6) {
        throw new Error('Please enter a valid 6-digit verification code');
      }

      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      console.log('Phone authentication successful');
      clearRecaptcha();
    } catch (error: any) {
      console.error('Phone code verification error:', error);
      
      // Detailed error handling
      switch (error.code) {
        case 'auth/invalid-verification-code':
          throw new Error('Invalid verification code. Please try again.');
        case 'auth/code-expired':
          throw new Error('Verification code has expired. Please request a new one.');
        default:
          throw new Error(error.message || 'Failed to verify code');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      clearRecaptcha();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    return await sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearRecaptcha();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    sendPhoneVerification,
    verifyPhoneCode,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
