import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../firebase/AuthContext';

interface Receipt {
  id: string;
  date: string;
  total: number;
  merchant: string;
  category: string;
  imageUrl: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface ReceiptContextType {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (receipt: Receipt | null) => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: React.ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setReceipts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const receiptsRef = collection(db, 'users', user.uid, 'receipts');
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
  }, [user]);

  return (
    <ReceiptContext.Provider
      value={{
        receipts,
        loading,
        error,
        selectedReceipt,
        setSelectedReceipt,
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
