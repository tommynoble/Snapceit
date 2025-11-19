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
  image_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'categorized' | 'ocr_done';
  category: string;
  category_id?: number;
  category_confidence?: number;
  ocr_confidence?: number; // Confidence from Textract extraction
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
  created_at?: string;
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
  correctReceipt: (receiptId: string, categoryId: number, reason?: string) => Promise<void>;
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
      
      // Get session token for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session available');
      }
      
      // Fetch from receipts_v2 using raw HTTP with session token
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/receipts_v2?user_id=eq.${currentUser.id}&order=created_at.desc`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch receipts');
      }

      const data = await response.json();
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
        throw new Error('Authentication required');
      }

      // Get session token for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session available');
      }

      // Generate UUID client-side to avoid DB constraint issues
      const crypto = await import('crypto');
      const receiptId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      // Payload with essential fields
      const receiptData = {
        id: receiptId,
        user_id: currentUser.id,
        merchant: receipt.merchant || 'Unknown Merchant',
        total: receipt.total || 0,
        image_url: receipt.imageUrl || null,
        status: 'pending'
      };

      // Use raw HTTP with session token for RLS
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/receipts_v2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=minimal', // Disable ON CONFLICT
          },
          body: JSON.stringify([receiptData]),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Return mock receipt (actual ID will be generated by DB)
      const newReceipt = {
        id: 'pending',
        user_id: currentUser.id,
        merchant: receipt.merchant || 'Unknown Merchant',
        total: receipt.total || 0,
        status: 'pending',
      };
      
      setReceipts(prev => [newReceipt as any, ...prev]);
      return newReceipt as any;
    } catch (error) {
      console.error('Receipt creation failed:', {
        code: (error as any).code,
        message: (error as any).message,
        details: (error as any).details
      });
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

      // Get session token for RLS
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session available');
      }

      console.log('Attempting to delete receipt:', { id, userId: currentUser.id });

      // Delete from receipts_v2 using raw HTTP with session token
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/receipts_v2?id=eq.${id}&user_id=eq.${currentUser.id}`;
      console.log('Delete URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete failed:', response.status, errorText);
        throw new Error(`Failed to delete receipt: ${response.status} ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Delete response:', responseText);
      console.log('Receipt deleted successfully:', id);
      
      // Update local state
      setReceipts(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  };

  // Old deleteReceipt code (commented out for reference)
  const _deleteReceiptOld = async (id: string) => {
    try {
      if (!currentUser?.id) {
        throw new Error('No user ID available');
      }

      // Always fetch the latest row from DB to get canonical image_url
      const { data: row, error: fetchErr } = await supabase
        .from('receipts')
        .select('id, user_id, image_url')
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .single();

      if (fetchErr) {
        console.warn('Warning: could not fetch receipt before delete:', fetchErr);
      }

      // Delete image from Supabase Storage if present
      if (row?.image_url) {
        try {
          // Expected public URL format:
          // https://<project>.supabase.co/storage/v1/object/public/receipts/<userId>/<timestamp>/image.jpg
          const splitKey = '/storage/v1/object/public/receipts/';
          const idx = row.image_url.indexOf(splitKey);
          if (idx !== -1) {
            const fileKey = row.image_url.substring(idx + splitKey.length); // userId/.../image.jpg
            const { error: delErr } = await supabase.storage
              .from('receipts')
              .remove([fileKey]);
            if (delErr) {
              console.warn('Storage delete failed:', delErr, 'key:', fileKey);
            } else {
              console.log('Storage file deleted:', fileKey);
            }
          } else {
            console.warn('Unexpected image_url format, skipping storage delete:', row.image_url);
          }
        } catch (e) {
          console.warn('Exception during storage delete:', e);
        }
      }

      // Note: OCR artifact in AWS S3 (ocr/{receiptId}.json) is NOT deleted
      // This is intentional for audit trail and recovery purposes
      // If needed, add AWS S3 cleanup via Lambda or separate cleanup job

      // Delete DB row
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

  const correctReceipt = async (receiptId: string, categoryId: number, reason?: string) => {
    try {
      if (!currentUser?.id) {
        throw new Error('No user ID available');
      }

      // Store correction in corrections table
      const { error: correctionError } = await supabase
        .from('corrections')
        .insert({
          user_id: currentUser.id,
          subject_type: 'receipt',
          subject_id: receiptId,
          category_id: categoryId,
          reason: reason || 'User correction',
        });

      if (correctionError) throw correctionError;

      // Update receipt with corrected category
      const { error: updateError } = await supabase
        .from('receipts')
        .update({
          category_id: categoryId,
          category_confidence: 1.0, // User correction = high confidence
          updated_at: new Date().toISOString(),
        })
        .eq('id', receiptId)
        .eq('user_id', currentUser.id);

      if (updateError) throw updateError;

      // Update local state
      setReceipts(prev =>
        prev.map(r =>
          r.id === receiptId
            ? { ...r, category_id: categoryId, category_confidence: 1.0 }
            : r
        )
      );

      toast.success('Receipt corrected successfully');
    } catch (error) {
      console.error('Error correcting receipt:', error);
      toast.error('Failed to correct receipt');
      throw error;
    }
  };

  // Fetch receipts on mount and when user changes
  useEffect(() => {
    if (currentUser?.id) {
      fetchReceipts();
      
      // Poll for updates every 30 seconds to catch Lambda status changes (reduced from 5s to prevent constant re-renders)
      const pollInterval = setInterval(() => {
        fetchReceipts();
      }, 30000);
      
      return () => clearInterval(pollInterval);
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
      refreshReceipts: fetchReceipts,
      correctReceipt
    }}>
      {children}
    </ReceiptContext.Provider>
  );
};
