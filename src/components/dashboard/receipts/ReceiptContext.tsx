import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../auth/SupabaseAuthContext';
import { supabase } from '../../../lib/supabase';

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
      if (!currentUser?.id) {
        throw new Error('No user ID available');
      }
      
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setError('Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const createReceipt = async (receipt: any) => {
    try {
      if (!currentUser?.id) {
        throw new Error('No user ID available');
      }

      const { data, error } = await supabase
        .from('receipts')
        .insert([
          {
            user_id: currentUser.id,
            merchant: receipt.merchant,
            amount: receipt.amount,
            total: receipt.total,
            category: receipt.category,
            receipt_date: receipt.date,
            items: receipt.items,
            tax: receipt.tax,
            image_url: receipt.imageUrl,
            status: 'completed',
            notes: receipt.notes,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setReceipts(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  };

  const updateReceipt = async (id: string, updates: any) => {
    try {
      if (!currentUser?.id) {
        throw new Error('No user ID available');
      }

      const { data, error } = await supabase
        .from('receipts')
        .update({
          merchant: updates.merchant,
          amount: updates.amount,
          total: updates.total,
          category: updates.category,
          receipt_date: updates.date,
          items: updates.items,
          tax: updates.tax,
          notes: updates.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) throw error;
      
      setReceipts(prev => prev.map(r => (r.id === id) ? data : r));
      return data;
    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      if (!currentUser?.id) {
        throw new Error('No user ID available');
      }

      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      setReceipts(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  };

  // Fetch receipts on mount and when user changes
  useEffect(() => {
    if (currentUser?.id) {
      fetchReceipts();
    }
  }, [currentUser?.id]); // Fetch when user ID changes

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
