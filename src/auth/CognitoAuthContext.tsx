import React, { createContext, useContext, useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  confirmSignUp, 
  resetPassword, 
  resendSignUpCode 
} from 'aws-amplify/auth';
import type { SignUpInput } from 'aws-amplify/auth';

interface AuthContextType {
  currentUser: any | null;
  loading: boolean;
  signup: (email: string, password: string, attributes: any) => Promise<{
    deliveryMedium: string;
    destination: string;
    username: string;
  }>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<{
    deliveryMedium: string;
    destination: string;
  }>;
  confirmSignUp: (email: string, confirmationCode: string) => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
    }
    setLoading(false);
  }

  async function signup(email: string, password: string, attributes: any) {
    console.log('Starting signup process...', { email, attributes });
    try {
      const signUpInput: SignUpInput = {
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: attributes.name,
            ...(attributes.phone_number && { phone_number: attributes.phone_number })
          },
          autoSignIn: true
        }
      };

      console.log('Sending signup request to Cognito...', { email });
      const { userId, nextStep } = await signUp(signUpInput);
      console.log('Signup successful!', { 
        userId, 
        nextStep,
        codeDelivery: nextStep.codeDeliveryDetails,
        destination: nextStep.codeDeliveryDetails?.destination,
        attributeName: nextStep.codeDeliveryDetails?.attributeName,
        deliveryMedium: nextStep.codeDeliveryDetails?.deliveryMedium
      });
      
      return {
        username: email,
        deliveryMedium: nextStep.signUpStep,
        destination: nextStep.codeDeliveryDetails?.destination || email
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ 
        username: email, 
        password 
      });
      if (isSignedIn) {
        const user = await getCurrentUser();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPasswordRequest = async (email: string) => {
    try {
      await resetPassword({ username: email });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const resendConfirmationCode = async (email: string) => {
    try {
      console.log('Resending confirmation code for:', email);
      const result = await resendSignUpCode({ username: email });
      console.log('Resend result:', {
        codeDelivery: result.codeDeliveryDetails,
        destination: result.codeDeliveryDetails?.destination,
        attributeName: result.codeDeliveryDetails?.attributeName,
        deliveryMedium: result.codeDeliveryDetails?.deliveryMedium
      });
      
      return {
        deliveryMedium: result.codeDeliveryDetails?.deliveryMedium || 'EMAIL',
        destination: result.codeDeliveryDetails?.destination || email
      };
    } catch (error) {
      console.error('Error resending confirmation code:', error);
      throw error;
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    try {
      if (!email || !code) {
        console.error('Missing required parameters:', { email, code });
        throw new Error('Email and verification code are required');
      }

      console.log('Confirming signup:', { 
        email, 
        codeLength: code?.length || 0,
        hasCode: !!code
      });

      const { confirmSignUp } = await import('@aws-amplify/auth');
      await confirmSignUp({ 
        username: email, 
        confirmationCode: code 
      });
      
      console.log('Signup confirmed successfully for:', email);
    } catch (error: any) {
      console.error('Error confirming signup:', {
        error: error.message,
        name: error.name,
        email: email,
        hasCode: !!code
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword: resetPasswordRequest,
    resendConfirmationCode,
    confirmSignUp
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
