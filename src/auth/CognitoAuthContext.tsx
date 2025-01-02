import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession, AuthUser, confirmSignUp as amplifyConfirmSignUp, resendSignUpCode } from '@aws-amplify/auth';
import { configureCognito } from '../config/cognito';

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, attributes?: Record<string, string>) => Promise<any>;
  confirmSignUp: (username: string, code: string) => Promise<any>;
  resendConfirmationCode: (username: string) => Promise<any>;
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        try {
          const user = await getCurrentUser();
          const session = await fetchAuthSession();
          console.log('[DEBUG] Initial user:', user);
          console.log('[DEBUG] Initial session:', session);
          setCurrentUser(user);
        } catch (userError: any) {
          console.log('[DEBUG] No authenticated user found:', userError);
          setCurrentUser(null);
        }
      } catch (error: any) {
        console.error('[DEBUG] Failed to initialize auth:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const signup = async (email: string, password: string, attributes: Record<string, string> = {}) => {
    try {
      // First try to sign up normally
      const { userId, userSub, isSignUpComplete } = await signUp({
        username: email.toLowerCase(),
        password,
        options: {
          userAttributes: {
            email: email.toLowerCase(),
            ...attributes
          },
          autoSignIn: true
        }
      });

      return {
        username: userId || userSub,
        deliveryMedium: 'EMAIL',
        destination: email
      };
    } catch (error: any) {
      // If the user exists but isn't confirmed, we can try to resend the code
      if (error.name === 'UsernameExistsException') {
        try {
          // Try to resend the confirmation code
          await resendSignUpCode({
            username: email.toLowerCase()
          });
          
          return {
            username: email.toLowerCase(),
            deliveryMedium: 'EMAIL',
            destination: email,
            resent: true
          };
        } catch (resendError: any) {
          // If resending fails, the user might be in a different state
          console.error('Error resending code:', resendError);
          throw error; // Throw the original error
        }
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('[DEBUG] Attempting login for:', email);
      
      const signInResult = await signIn({
        username: email.toLowerCase(),
        password
      });
      
      console.log('[DEBUG] Sign in response:', signInResult);
      
      if (signInResult?.isSignedIn) {
        try {
          const currentUser = await getCurrentUser();
          const session = await fetchAuthSession();
          console.log('[DEBUG] Login successful');
          console.log('[DEBUG] User:', currentUser);
          console.log('[DEBUG] Session:', session);
          setCurrentUser(currentUser);
          return { success: true, user: currentUser };
        } catch (error) {
          console.error('[DEBUG] Failed to get user/session after login:', error);
          throw error;
        }
      }
      
      return signInResult;
    } catch (error: any) {
      console.error('[DEBUG] Login failed:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
    } catch (error: any) {
      console.error('[DEBUG] Logout failed:', error);
      setError(error.message);
      throw error;
    }
  };

  const confirmSignUp = async (username: string, code: string) => {
    try {
      setError(null);
      console.log('[DEBUG] Confirming sign up for username:', username);
      
      const result = await amplifyConfirmSignUp({
        username,
        confirmationCode: code,
      });
      
      console.log('[DEBUG] Confirm sign up response:', result);
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[DEBUG] Confirm sign up failed:', error);
      setError(error.message);
      throw error;
    }
  };

  const resendConfirmationCode = async (username: string) => {
    try {
      setError(null);
      console.log('[DEBUG] Resending confirmation code for username:', username);
      
      const result = await resendSignUpCode({
        username,
      });
      
      console.log('[DEBUG] Resend code response:', result);
      return {
        deliveryMedium: 'EMAIL',
        destination: username
      };
    } catch (error: any) {
      console.error('[DEBUG] Failed to resend code:', error);
      setError(error.message);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, login, logout, signup, confirmSignUp, resendConfirmationCode }}>
      {children}
    </AuthContext.Provider>
  );
};
