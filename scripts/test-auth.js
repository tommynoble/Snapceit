const { CognitoIdentityProviderClient, InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({});

async function getAuthToken() {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: '13fdeji4s9mbd492uqat21ihi6', // Your Cognito App Client ID
      AuthParameters: {
        USERNAME: 'thomas.asante@meltwater.org',
        PASSWORD: 'Test1234!'
      }
    });

    const response = await client.send(command);
    console.log('Access Token:', response.AuthenticationResult.AccessToken);
    console.log('ID Token:', response.AuthenticationResult.IdToken);
    return response.AuthenticationResult;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

getAuthToken();
