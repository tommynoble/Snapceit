import jwt_decode from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  exp: number;
  [key: string]: any;
}

export const Auth = {
  decodeToken: async (token: string): Promise<DecodedToken> => {
    try {
      const decoded = jwt_decode(token) as DecodedToken;
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Invalid token');
    }
  }
};
