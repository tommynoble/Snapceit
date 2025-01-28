import React, { createContext, useContext, useState, useEffect } from 'react';
import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";

interface AuthContextType {
  currentUser: any | null;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, options?: { resend?: boolean }) => Promise<any>;
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
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const client = new CognitoIdentityProviderClient({
    region: import.meta.env.VITE_AWS_REGION
  });

  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  // Try to restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    console.log('Checking stored user data...');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('Found stored user data:', {
          email: userData.email,
          hasAccessToken: !!userData.accessToken,
          hasIdToken: !!userData.idToken,
          tokenTimestamp: userData.tokenTimestamp
        });
        
        // Check if we have both tokens
        if (userData.idToken && userData.accessToken) {
          // Check if tokens are expired (1 hour)
          const tokenAge = Date.now() - (userData.tokenTimestamp || 0);
          if (tokenAge > 3600000) { // 1 hour in milliseconds
            console.log('Tokens are expired, clearing user data');
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
          } else {
            console.log('Setting current user with valid tokens');
            setCurrentUser(userData);
          }
        } else {
          console.log('Missing required tokens, clearing user data');
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    } else {
      console.log('No stored user data found');
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      setError(null);
      
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email.toLowerCase(),
          PASSWORD: password
        }
      });

      console.log('Sending auth command...');
      const response = await client.send(command);
      console.log('Auth response received');
      
      const accessToken = response.AuthenticationResult?.AccessToken;
      const idToken = response.AuthenticationResult?.IdToken;

      if (!accessToken || !idToken) {
        console.error('Missing tokens in auth response');
        throw new Error('Failed to get authentication tokens');
      }

      console.log('Got tokens:', {
        hasAccessToken: !!accessToken,
        hasIdToken: !!idToken
      });

      const userData = {
        email: email.toLowerCase(),
        accessToken,
        idToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
        tokenTimestamp: Date.now()
      };

      console.log('Storing user data...');
      localStorage.setItem('currentUser', JSON.stringify(userData));
      console.log('Setting current user...');
      setCurrentUser(userData);
      console.log('Login complete');

      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle unverified users
      if (error.name === 'UserNotConfirmedException') {
        // Automatically resend verification code
        try {
          await resendConfirmationCode(email);
          
          // Instead of setting an error, throw a special error that our login form can handle
          throw {
            name: 'UnverifiedUserError',
            message: 'Please verify your email first. A new verification code has been sent.',
            email: email.toLowerCase()
          };
        } catch (resendError: any) {
          console.error('Error resending verification code:', resendError);
          // If the user doesn't exist or other errors, let them try signing up
          if (resendError.name === 'UserNotFoundException') {
            throw new Error('No account found with this email. Please sign up.');
          }
          // For other errors during resend, let them try the verification page anyway
          throw {
            name: 'UnverifiedUserError',
            message: 'Please verify your email to continue.',
            email: email.toLowerCase()
          };
        }
      }
      
      // Handle other common errors
      if (error.name === 'NotAuthorizedException') {
        throw new Error('Incorrect email or password');
      }
      if (error.name === 'UserNotFoundException') {
        throw new Error('No account found with this email. Please sign up.');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const signup = async (email: string, password: string, options: { resend?: boolean } = {}) => {
    try {
      if (options.resend) {
        const command = new ResendConfirmationCodeCommand({
          ClientId: clientId,
          Username: email,
        });
        const response = await client.send(command);
        return response;
      }

      const command = new SignUpCommand({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
        ],
      });

      const response = await client.send(command);
      
      // Store password temporarily in sessionStorage for auto-login after verification
      sessionStorage.setItem(`temp_password_${email.toLowerCase()}`, password);
      
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const confirmSignUp = async (username: string, code: string) => {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: username.toLowerCase(),
        ConfirmationCode: code
      });

      const response = await client.send(command);

      // After successful verification, automatically log them in
      try {
        // Get the password from sessionStorage (temporarily stored during signup)
        const tempPassword = sessionStorage.getItem(`temp_password_${username.toLowerCase()}`);
        if (tempPassword) {
          await login(username, tempPassword);
          // Clear the temporary password
          sessionStorage.removeItem(`temp_password_${username.toLowerCase()}`);
        }
      } catch (loginError) {
        console.error('Auto-login after verification failed:', loginError);
        // Don't throw here, let them log in manually if auto-login fails
      }

      return response;
    } catch (error: any) {
      console.error('Confirm signup error:', error);
      throw error;
    }
  };

  const resendConfirmationCode = async (username: string) => {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: clientId,
        Username: username.toLowerCase()
      });

      const response = await client.send(command);
      return response;
    } catch (error: any) {
      console.error('Resend confirmation code error:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const command = new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: clientId,
        AuthParameters: {
          REFRESH_TOKEN: user.refreshToken,
        }
      });

      const response = await client.send(command);
      const accessToken = response.AuthenticationResult?.AccessToken;
      const idToken = response.AuthenticationResult?.IdToken;

      if (!accessToken || !idToken) {
        throw new Error('Failed to refresh tokens');
      }

      const userData = {
        ...user,
        accessToken,
        idToken
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, log out the user
      await logout();
    }
  };

  // Add token refresh interval
  useEffect(() => {
    if (currentUser) {
      // Refresh token every 45 minutes (tokens typically expire after 1 hour)
      const interval = setInterval(refreshToken, 45 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    error,
    login,
    logout,
    signup,
    confirmSignUp,
    resendConfirmationCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
