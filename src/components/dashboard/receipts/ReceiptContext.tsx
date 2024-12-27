import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../../auth/CognitoAuthContext';
import { api } from '../../../utils/api';

export interface Receipt {
  id: string;
  merchant: string;
  total: number;
  date: string;
  items: Array<{
    name: string;
    price: number;
  }>;
  imageUrl?: string;
  status: 'processing' | 'completed';
  category: string;
  tax?: {
    total: number;
    breakdown?: {
      salesTax?: number;
      stateTax?: number;
      localTax?: number;
      otherTaxes?: Array<{
        name: string;
        amount: number;
      }>;
    };
  };
  createdAt?: string;
  updatedAt?: string;
  userId: string;
}

interface ReceiptContextType {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (receipt: Receipt | null) => void;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'userId'>) => Promise<void>;
  updateReceipt: (id: string, updates: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (receiptId: string) => Promise<void>;
  refreshReceipts: () => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function useReceipts() {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return context;
}

export function ReceiptProvider({ children }: { children: React.ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const { currentUser } = useAuth();

  const fetchReceipts = async () => {
    if (!currentUser?.sub) return;

    try {
      setLoading(true);
      const data = await api.receipts.list(currentUser.sub);
      setReceipts(data.map((r: any) => ({
        id: r.receiptId,
        merchant: r.merchantName,
        total: r.total,
        date: r.date,
        items: r.items?.map((item: any) => ({
          name: item.description,
          price: item.price
        })) || [],
        imageUrl: r.imageUrl,
        status: r.status,
        category: r.category,
        tax: r.tax,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        userId: r.userId
      })));
      setError(null);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.sub) {
      fetchReceipts();
    } else {
      setReceipts([]);
      setLoading(false);
    }
  }, [currentUser]);

  const addReceipt = async (receipt: Omit<Receipt, 'id' | 'userId'>) => {
    if (!currentUser?.sub) {
      throw new Error('User must be logged in to add receipts');
    }

    try {
      const newReceipt = await api.receipts.create({
        ...receipt,
        merchantName: receipt.merchant,
        createdAt: new Date().toISOString(),
      });

      setReceipts(prev => [...prev, {
        ...receipt,
        id: newReceipt.receiptId,
        userId: currentUser.sub
      } as Receipt]);

    } catch (err) {
      console.error('Error adding receipt:', err);
      throw err;
    }
  };

  const updateReceipt = async (id: string, updates: Partial<Receipt>) => {
    if (!currentUser?.sub) return;

    try {
      const updatedReceipt = await api.receipts.update(currentUser.sub, id, {
        ...updates,
        merchantName: updates.merchant,
      });

      setReceipts(prev => prev.map(r => 
        r.id === id ? { ...r, ...updates, updatedAt: updatedReceipt.updatedAt } : r
      ));
    } catch (err) {
      console.error('Error updating receipt:', err);
      throw err;
    }
  };

  const deleteReceipt = async (receiptId: string) => {
    if (!currentUser?.sub) return;

    try {
      await api.receipts.delete(currentUser.sub, receiptId);
      setReceipts(prev => prev.filter(r => r.id !== receiptId));
    } catch (err) {
      console.error('Error deleting receipt:', err);
      throw err;
    }
  };

  return (
    <ReceiptContext.Provider value={{
      receipts,
      loading,
      error,
      selectedReceipt,
      setSelectedReceipt,
      addReceipt,
      updateReceipt,
      deleteReceipt,
      refreshReceipts: fetchReceipts
    }}>
      {children}
    </ReceiptContext.Provider>
  );
}
