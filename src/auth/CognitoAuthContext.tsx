import React, { createContext, useContext, useState } from 'react';
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

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email.toLowerCase(),
          PASSWORD: password
        }
      });

      const response = await client.send(command);
      const accessToken = response.AuthenticationResult?.AccessToken;
      const idToken = response.AuthenticationResult?.IdToken;

      if (!accessToken || !idToken) {
        throw new Error('Failed to get authentication tokens');
      }

      setCurrentUser({
        username: email.toLowerCase(),
        accessToken,
        idToken
      });

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
      setError(null);
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
      setError(null);
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
