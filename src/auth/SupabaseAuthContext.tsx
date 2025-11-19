import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<any>;
  confirmSignUp: (email: string, token: string) => Promise<any>;
  resendConfirmationCode: (email: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) throw error;

      setCurrentUser(data.user);
      setSession(data.session);
      
      // Store tokens if needed
      if (data.session) {
        localStorage.setItem('accessToken', data.session.access_token);
        localStorage.setItem('refreshToken', data.session.refresh_token);
      }

      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setCurrentUser(null);
      setSession(null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      // First, sign up the user
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
      });

      if (signupError) throw signupError;

      // Then send OTP code to email
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
      });

      if (otpError) throw otpError;

      return signupData;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const confirmSignUp = async (email: string, token: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const loginWithOtp = async (email: string) => {
    try {
      setError(null);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
      });

      if (otpError) throw otpError;

      return { success: true };
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const verifyLoginOtp = async (email: string, token: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) throw error;

      setCurrentUser(data.user);
      setSession(data.session);

      // Store tokens if needed
      if (data.session) {
        localStorage.setItem('accessToken', data.session.access_token);
        localStorage.setItem('refreshToken', data.session.refresh_token);
      }

      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const resendConfirmationCode = async (email: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase(),
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    session,
    error,
    login,
    loginWithOtp,
    verifyLoginOtp,
    logout,
    signup,
    confirmSignUp,
    resendConfirmationCode,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
