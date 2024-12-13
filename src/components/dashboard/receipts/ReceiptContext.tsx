import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../firebase/AuthContext';

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
}

interface ReceiptContextType {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (receipt: Receipt | null) => void;
  addReceipt: (receipt: Omit<Receipt, 'id'>) => Promise<void>;
  deleteReceipt: (receiptId: string) => Promise<boolean>;
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
          const data = doc.data();
          const receipt = {
            id: doc.id,
            merchant: data.merchant || 'Unknown Merchant',
            total: Number(data.total) || 0, // Ensure total is always a number
            date: new Date(data.date || new Date()).toISOString(), // Ensure date is always ISO string
            items: Array.isArray(data.items) ? data.items.map(item => ({
              ...item,
              price: Number(item.price) || 0 // Ensure item prices are numbers
            })) : [],
            imageUrl: data.imageUrl,
            status: data.status || 'completed',
            category: data.category || 'Uncategorized'
          };
          console.log('Loading receipt:', receipt);
          receiptData.push(receipt);
        });
        console.log('All receipts loaded:', receiptData);
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

    console.log('Adding receipt with data:', receipt);
    const receiptsRef = collection(db, 'receipts', currentUser.uid, 'userReceipts');
    
    // Ensure the date is in ISO format
    const date = receipt.date ? new Date(receipt.date).toISOString() : new Date().toISOString();
    
    const validatedReceipt = {
      ...receipt,
      total: Number(receipt.total), // Ensure total is a number
      date,
      createdAt: new Date().toISOString()
    };

    console.log('Saving receipt with validated data:', validatedReceipt);
    
    try {
      await addDoc(receiptsRef, validatedReceipt);
      console.log('Receipt saved successfully with total:', validatedReceipt.total);
    } catch (error) {
      console.error('Error saving receipt:', error);
      throw error;
    }
  };

  const deleteReceipt = async (receiptId: string) => {
    if (!currentUser) {
      throw new Error('Must be logged in to delete receipts');
    }

    try {
      const receiptRef = doc(db, 'receipts', currentUser.uid, 'userReceipts', receiptId);
      await deleteDoc(receiptRef);
      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
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
        deleteReceipt,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  );
}
