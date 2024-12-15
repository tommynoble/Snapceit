import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../firebase/AuthContext';
import { dynamoDb, type ReceiptItem } from '../../../utils/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { testDynamoDBConnection } from '../../../utils/test-dynamo';

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
  taxDeductible?: boolean;
  taxCategory?: 'business' | 'personal' | 'medical' | 'charity' | 'education';
  vendor?: {
    name: string;
    address?: string;
    phone?: string;
    addressBlock?: string;
    city?: string;
    state?: string;
  };
  receiptDate?: string;
  rawTextractData?: {
    [key: string]: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ReceiptContextType {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (receipt: Receipt | null) => void;
  addReceipt: (receipt: Omit<Receipt, 'id'>) => Promise<void>;
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

  useEffect(() => {
    if (!currentUser) {
      setReceipts([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchReceipts() {
      if (!mounted) return;
      
      try {
        const dynamoReceipts = await dynamoDb.queryReceipts(currentUser.uid);
        
        if (!mounted) return;

        // Transform DynamoDB receipts to match our Receipt interface
        const receiptsData = dynamoReceipts.map(r => ({
          id: r.receiptId,
          merchant: r.merchantName,
          total: r.total,
          date: r.date,
          items: r.items?.map(item => ({
            name: item.description,
            price: item.price
          })) || [],
          imageUrl: r.imageUrl,
          status: r.status || 'completed',
          category: r.category || 'Uncategorized',
          tax: r.tax,
          vendor: {
            name: r.merchantName,
            address: r.vendor?.address,
            phone: r.vendor?.phone,
            addressBlock: r.vendor?.addressBlock,
            city: r.vendor?.city,
            state: r.vendor?.state
          },
          rawTextractData: r.rawTextractData,
          taxDeductible: r.taxDeductible,
          taxCategory: r.taxCategory,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        }));

        // Only update state if the data has actually changed
        setReceipts(prevReceipts => {
          const hasChanged = JSON.stringify(prevReceipts) !== JSON.stringify(receiptsData);
          return hasChanged ? receiptsData : prevReceipts;
        });

        if (loading) setLoading(false);
      } catch (error) {
        console.error('Error fetching receipts:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Error fetching receipts');
          setLoading(false);
        }
      }
    }

    // Initial fetch
    setLoading(true);
    fetchReceipts();

    // Set up polling every 5 seconds
    const pollInterval = setInterval(fetchReceipts, 5000);

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(pollInterval);
    };
  }, [currentUser]);

  const addReceipt = async (receipt: Omit<Receipt, 'id'>) => {
    if (!currentUser) {
      throw new Error('Must be logged in to add receipts');
    }

    try {
      console.log('Starting receipt upload process...');
      
      // Generate a unique ID that will be used in both databases
      const receiptId = uuidv4();
      console.log('Generated receipt ID:', receiptId);
      
      // Add to Firestore
      const receiptsRef = collection(db, 'receipts', currentUser.uid, 'userReceipts');
      await addDoc(receiptsRef, {
        ...receipt,
        id: receiptId,
        createdAt: new Date().toISOString(),
      });
      console.log('Receipt added to Firestore');

      // Add to DynamoDB
      const dynamoReceipt = {
        userId: currentUser.uid,
        receiptId,
        merchantName: receipt.merchant,
        date: receipt.date,
        total: receipt.total,
        tax: receipt.tax ? {
          total: receipt.tax.total || 0,
          breakdown: {
            salesTax: receipt.tax.breakdown?.salesTax || 0,
            stateTax: receipt.tax.breakdown?.stateTax || 0,
            localTax: receipt.tax.breakdown?.localTax || 0,
            otherTaxes: receipt.tax.breakdown?.otherTaxes || []
          }
        } : {
          total: 0,
          breakdown: {
            salesTax: 0,
            stateTax: 0,
            localTax: 0,
            otherTaxes: []
          }
        },
        items: receipt.items?.map(item => ({
          description: item.name,
          price: item.price
        })),
        category: receipt.category,
        imageUrl: receipt.imageUrl,
        createdAt: new Date().toISOString()
      };
      console.log('Preparing DynamoDB receipt with tax info:', dynamoReceipt);
      
      await dynamoDb.putReceipt(dynamoReceipt);
      console.log('Receipt successfully added to DynamoDB');

    } catch (error) {
      console.error('Error adding receipt:', error);
      throw error;
    }
  };

  const updateReceipt = async (id: string, updates: Partial<Receipt>) => {
    if (!currentUser) {
      throw new Error('Must be logged in to update receipts');
    }

    try {
      // Update in Firestore
      const receiptRef = doc(db, 'receipts', currentUser.uid, 'userReceipts', id);
      await updateDoc(receiptRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      // Update in DynamoDB
      await dynamoDb.updateReceipt(currentUser.uid, id, {
        merchantName: updates.merchant,
        date: updates.date,
        total: updates.total,
        tax: updates.tax,
        items: updates.items?.map(item => ({
          description: item.name,
          price: item.price
        })),
        category: updates.category,
        imageUrl: updates.imageUrl,
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  };

  const deleteReceipt = async (receiptId: string) => {
    if (!currentUser) {
      throw new Error('Must be logged in to delete receipts');
    }

    try {
      console.log('Deleting receipt from DynamoDB:', receiptId);
      await dynamoDb.deleteReceipt(currentUser.uid, receiptId);
      console.log('Successfully deleted receipt from DynamoDB');

      // Update local state to remove the deleted receipt
      setReceipts(prevReceipts => prevReceipts.filter(r => r.id !== receiptId));

    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  };

  const refreshReceipts = () => {
    if (!currentUser) return;
    
    let mounted = true;
    
    async function refresh() {
      try {
        setLoading(true);
        const dynamoReceipts = await dynamoDb.queryReceipts(currentUser.uid);
        
        if (!mounted) return;
        
        const receiptsData = dynamoReceipts.map(r => ({
          id: r.receiptId,
          merchant: r.merchantName,
          total: r.total,
          date: r.date,
          items: r.items?.map(item => ({
            name: item.description,
            price: item.price
          })) || [],
          imageUrl: r.imageUrl,
          status: r.status || 'completed',
          category: r.category || 'Uncategorized',
          tax: r.tax,
          vendor: {
            name: r.merchantName,
            address: r.vendor?.address,
            phone: r.vendor?.phone,
            addressBlock: r.vendor?.addressBlock,
            city: r.vendor?.city,
            state: r.vendor?.state
          },
          rawTextractData: r.rawTextractData,
          taxDeductible: r.taxDeductible,
          taxCategory: r.taxCategory,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        }));

        setReceipts(receiptsData);
      } catch (error) {
        console.error('Error refreshing receipts:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Error refreshing receipts');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    refresh();
    return () => {
      mounted = false;
    };
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
        updateReceipt,
        deleteReceipt,
        refreshReceipts,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  );
}
