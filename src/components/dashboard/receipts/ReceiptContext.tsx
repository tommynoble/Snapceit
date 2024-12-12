import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../firebase/AuthContext';

interface Receipt {
  id?: string;
  date: string;
  total: number;
  merchant: string;
  category: string;
  imageUrl?: string;
  preview?: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  status: 'processing' | 'completed' | 'error';
}

interface ReceiptContextType {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (receipt: Receipt | null) => void;
  addReceipt: (receipt: Omit<Receipt, 'id'>) => Promise<void>;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: React.ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setReceipts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const receiptsRef = collection(db, 'receipts', currentUser.uid, 'userReceipts');
    const q = query(receiptsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const receiptData: Receipt[] = [];
        snapshot.forEach((doc) => {
          receiptData.push({ id: doc.id, ...doc.data() } as Receipt);
        });
        setReceipts(receiptData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching receipts:', err);
        setError('Failed to load receipts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const addReceipt = async (receipt: Omit<Receipt, 'id'>) => {
    if (!currentUser) {
      throw new Error('Must be logged in to add receipts');
    }

    const receiptsRef = collection(db, 'receipts', currentUser.uid, 'userReceipts');
    
    const validatedReceipt = {
      ...receipt,
      date: receipt.date || new Date().toISOString(),
      total: receipt.total || 0,
      merchant: receipt.merchant || 'Unknown Merchant',
      items: Array.isArray(receipt.items) ? receipt.items : [],
      category: receipt.category || 'Uncategorized',
      status: receipt.status || 'processing',
    };

    await addDoc(receiptsRef, validatedReceipt);
  };

  return (
    <ReceiptContext.Provider
      value={{
        receipts,
        loading,
        error,
        selectedReceipt,
        setSelectedReceipt,
        addReceipt,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipts() {
  const context = useContext(ReceiptContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return context;
}
