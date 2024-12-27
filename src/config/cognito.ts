import { Amplify } from 'aws-amplify';

export const configureCognito = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        signUpVerificationMethod: 'code',
        verificationMechanisms: ['email'],
        loginWith: {
          email: true,
          phone: false,
          username: false
        }
      }
    }
  });
};
