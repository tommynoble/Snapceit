import axios from 'axios';
import * as AxiosLogger from 'axios-logger';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added auth token to request');
    } else {
      console.warn('No user logged in');
    }
    return config;
  } catch (error) {
    console.error('Error adding auth token:', error);
    return Promise.reject(error);
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
