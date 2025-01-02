import { Amplify } from '@aws-amplify/core';

export const configureCognito = () => {
  try {
    const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
    const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const region = import.meta.env.VITE_AWS_REGION;

    if (!userPoolId || !userPoolClientId || !region) {
      throw new Error('Missing required Cognito configuration. Check your .env file.');
    }

    const config = {
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          loginMechanisms: ['email']
        }
      }
    };
    
    console.log('[DEBUG] Amplify configuration:', config);
    Amplify.configure(config);
    console.log('[DEBUG] Cognito configured successfully');
  } catch (error) {
    console.error('[DEBUG] Error configuring Cognito:', error);
    throw error;
  }
};
