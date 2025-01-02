import { Amplify } from '@aws-amplify/core';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;

interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

async function getAuthToken(): Promise<string> {
  try {
    const currentUser = await getCurrentUser();
    const userAttributes = await fetchUserAttributes();
    // You might need to adjust this depending on how you're handling tokens
    return userAttributes.token || '';
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

async function apiRequest(endpoint: string, options: ApiOptions) {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Receipt endpoints
  receipts: {
    list: async (userId: string) => {
      return apiRequest(`/receipts/${userId}`, { method: 'GET' });
    },
    
    get: async (userId: string, receiptId: string) => {
      return apiRequest(`/receipts/${userId}/${receiptId}`, { method: 'GET' });
    },
    
    create: async (receipt: any) => {
      return apiRequest('/receipts', { 
        method: 'POST',
        body: receipt
      });
    },
    
    update: async (userId: string, receiptId: string, updates: any) => {
      return apiRequest(`/receipts/${userId}/${receiptId}`, {
        method: 'PUT',
        body: updates
      });
    },
    
    delete: async (userId: string, receiptId: string) => {
      return apiRequest(`/receipts/${userId}/${receiptId}`, { method: 'DELETE' });
    }
  },

  // User settings endpoints
  settings: {
    get: async (userId: string) => {
      return apiRequest(`/settings/${userId}`, { method: 'GET' });
    },
    
    update: async (userId: string, settings: any) => {
      return apiRequest(`/settings/${userId}`, {
        method: 'PUT',
        body: settings
      });
    }
  }
};
