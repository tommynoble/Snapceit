import { Amplify } from '@aws-amplify/core';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;

interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

async function getAuthToken() {
  try {
    // Get the current user from our auth context instead of Amplify
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    return currentUser.accessToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

async function getCurrentUserEmail() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    return currentUser.username;
  } catch (error) {
    console.error('Error getting user email:', error);
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

export async function uploadImage(file: File) {
  try {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function getImages() {
  try {
    const token = await getAuthToken();
    const email = await getCurrentUserEmail();

    const response = await fetch(`${API_BASE_URL}/images?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

export async function searchImages(query: string) {
  try {
    const token = await getAuthToken();
    const email = await getCurrentUserEmail();

    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching images:', error);
    throw error;
  }
}

export async function deleteImage(imageId: string) {
  try {
    const token = await getAuthToken();
    const email = await getCurrentUserEmail();

    const response = await fetch(`${API_BASE_URL}/images/${imageId}?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
