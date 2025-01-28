import { useAuth } from '../auth/CognitoAuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
}

async function apiRequest(endpoint: string, options: ApiOptions) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5184'
    };

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    const config: RequestInit = {
      method: options.method,
      headers,
      credentials: 'include',
      body: options.body ? JSON.stringify(options.body) : undefined
    };

    console.log('Making request:', {
      url: `${API_BASE_URL}${endpoint}`,
      method: options.method,
      headers
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

export const api = {
  test: {
    check(token: string) {
      return apiRequest('/test', { method: 'GET', token });
    }
  },
  
  receipts: {
    list(token: string) {
      return apiRequest('/receipts', { method: 'GET', token });
    },
    
    create(receipt: any, token: string) {
      return apiRequest('/receipts', {
        method: 'POST',
        body: receipt,
        token
      });
    },
    
    update(receiptId: string, updates: any, token: string) {
      return apiRequest(`/receipts/${receiptId}`, {
        method: 'PUT',
        body: updates,
        token
      });
    },
    
    delete(receiptId: string, token: string) {
      return apiRequest(`/receipts/${receiptId}`, {
        method: 'DELETE',
        token
      });
    }
  },

  upload: {
    getUploadUrl(fileName: string, fileType: string, token: string) {
      return apiRequest('/upload-url', {
        method: 'POST',
        body: { fileName, fileType },
        token
      });
    },
    
    async uploadToS3(uploadUrl: string, file: File) {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload to S3');
      }
      
      return response;
    },
    
    processReceipt(key: string, token: string) {
      return apiRequest('/process', {
        method: 'POST',
        body: { key },
        token
      });
    }
  },

  profile: {
    getUploadUrl(fileName: string, fileType: string, token: string) {
      return apiRequest('/profile/upload-url', {
        method: 'POST',
        body: { fileName, fileType },
        token
      });
    },

    updateProfile(photoURL: string, token: string) {
      return apiRequest('/profile', {
        method: 'PUT',
        body: { photoURL },
        token
      });
    }
  },

  settings: {
    getSettings(token: string) {
      return apiRequest('/settings', {
        method: 'GET',
        token
      });
    },

    updateCurrency(currency: string, token: string) {
      return apiRequest('/settings/currency', {
        method: 'PUT',
        body: { currency },
        token
      });
    }
  }
};
