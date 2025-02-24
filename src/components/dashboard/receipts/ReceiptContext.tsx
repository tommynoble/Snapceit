import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../auth/CognitoAuthContext';

export interface Receipt {
  id: string;
  merchant: string;
  total: number;
  date: string;
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  imageUrl?: string;
  status: 'processing' | 'completed';
  category: string;
  tax?: {
    total: number;
    type?: string;
  };
  subtotal?: number;
  paymentMethod?: string;
  address?: string;
  phone?: string;
  invoiceNumber?: string;
  createdAt?: string;
  receiptId?: string;
}

interface ReceiptContextType {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (receipt: Receipt | null) => void;
  addReceipt: (receipt: Omit<Receipt, 'id'>) => Promise<Receipt>;
  updateReceipt: (id: string, updates: Partial<Receipt>) => Promise<Receipt>;
  deleteReceipt: (receiptId: string) => Promise<void>;
  refreshReceipts: () => Promise<void>;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export const useReceipts = () => {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return context;
};

export const ReceiptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const { currentUser } = useAuth();

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      if (!currentUser?.idToken) {
        throw new Error('No ID token available');
      }
      const data = await api.receipts.list(currentUser.idToken);
      setReceipts(data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setError('Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const createReceipt = async (receipt: any) => {
    try {
      if (!currentUser?.idToken) {
        throw new Error('No ID token available');
      }
      const data = await api.receipts.create(receipt, currentUser.idToken);
      setReceipts(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  };

  const updateReceipt = async (id: string, updates: any) => {
    try {
      if (!currentUser?.idToken) {
        throw new Error('No ID token available');
      }

      console.log('Updating receipt:', { id, updates }); // Debug log

      const data = await api.receipts.update(id, updates, currentUser.idToken);
      
      // Immediately update the local state with the new data
      setReceipts(prev => prev.map(r => {
        if (r.id === id || r.receiptId === id) {
          const updatedReceipt = { ...r, ...updates };
          console.log('Updated receipt:', updatedReceipt); // Debug log
          return updatedReceipt;
        }
        return r;
      }));
      
      // Refresh receipts to get the latest data from server
      await fetchReceipts();
      
      return data;
    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      if (!currentUser?.idToken) {
        throw new Error('No ID token available');
      }
      await api.receipts.delete(id, currentUser.idToken);
      setReceipts(prev => prev.filter(r => r.id !== id && r.receiptId !== id));
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  };

  // Fetch receipts on mount and when user changes
  useEffect(() => {
    if (currentUser?.idToken) {
      fetchReceipts();
    }
  }, [currentUser?.idToken]); // Fetch when user token changes

  return (
    <ReceiptContext.Provider value={{
      receipts,
      loading,
      error,
      selectedReceipt,
      setSelectedReceipt,
      addReceipt: createReceipt,
      updateReceipt,
      deleteReceipt,
      refreshReceipts: fetchReceipts
    }}>
      {children}
    </ReceiptContext.Provider>
  );
};
