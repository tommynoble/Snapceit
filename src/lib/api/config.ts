import axios from 'axios';
import { Auth } from '@aws-amplify/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request logging in development
if (import.meta.env.DEV) {
  api.interceptors.request.use(
    (request) => {
      console.log('API Request:', {
        url: request.url,
        method: request.method,
        headers: request.headers
      });
      return request;
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log('API Response:', {
        status: response.status,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error('Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return Promise.reject(error);
    }
  );
}

// Add a request interceptor to add Cognito auth token
api.interceptors.request.use(async (config) => {
  try {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Added auth token to request');
    return config;
  } catch (error) {
    // If there's no session, proceed without token
    console.warn('No user logged in');
    return config;
  }
});

// Add response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data
      });
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error:', error.request);
      return Promise.reject({ 
        error: 'Network error occurred',
        status: 'network_error' 
      });
    }
    // Something else happened
    console.error('Request Error:', error.message);
    return Promise.reject({ 
      error: 'Request failed',
      status: 'request_error'
    });
  }
);

export default api;
