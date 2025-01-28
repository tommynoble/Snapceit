import { useState, useCallback } from 'react';
import { Receipt } from '../types/receipt';

const API_URL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url.com';

export const useReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/receipts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you use JWT
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch receipts');
      
      const data = await response.json();
      setReceipts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadReceipt = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch(`${API_URL}/receipts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload receipt');
      
      const data = await response.json();
      setReceipts(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReceipt = useCallback(async (receiptId: string, updates: Partial<Receipt>) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/receipts/${receiptId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update receipt');
      
      const updatedReceipt = await response.json();
      setReceipts(prev => prev.map(r => 
        r.receiptId === receiptId ? updatedReceipt : r
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    receipts,
    loading,
    error,
    fetchReceipts,
    uploadReceipt,
    updateReceipt
  };
};
