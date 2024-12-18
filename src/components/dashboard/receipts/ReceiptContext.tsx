import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../../firebase/AuthContext';
import { dynamoDb } from '../../../utils/dynamodb';
import { v4 as uuidv4 } from 'uuid';

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
  taxCategory?: 'advertising' | 'car_and_truck' | 'office' | 'taxes_and_licenses' | 'supplies' | 'travel_and_meals';
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
  userId: string;
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

        setReceipts(receiptsData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching receipts:', err);
        if (mounted) {
          setError('Failed to fetch receipts');
          setLoading(false);
        }
      }
    }

    fetchReceipts();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const addReceipt = async (receipt: Omit<Receipt, 'id'>) => {
    if (!currentUser) {
      throw new Error('Must be logged in to add receipts');
    }

    try {
      // Generate a unique ID
      const receiptId = uuidv4();
      
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
        } : undefined,
        items: receipt.items?.map(item => ({
          description: item.name,
          price: item.price
        })),
        category: receipt.category,
        imageUrl: receipt.imageUrl,
        status: receipt.status || 'completed',
        createdAt: new Date().toISOString()
      };

      await dynamoDb.putReceipt(dynamoReceipt);
      
      const newReceipt = { 
        ...receipt, 
        id: receiptId 
      } as Receipt;
      
      setReceipts(prev => [...prev, newReceipt]);
    } catch (err) {
      console.error('Error adding receipt:', err);
      throw err;
    }
  };

  const updateReceipt = async (id: string, updates: Partial<Receipt>) => {
    if (!currentUser) {
      throw new Error('Must be logged in to update receipts');
    }

    try {
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
        status: updates.status,
        updatedAt: new Date().toISOString()
      });
      
      setReceipts(prev =>
        prev.map(receipt =>
          receipt.id === id ? { ...receipt, ...updates } : receipt
        )
      );
    } catch (err) {
      console.error('Error updating receipt:', err);
      throw err;
    }
  };

  const deleteReceipt = async (receiptId: string) => {
    if (!currentUser) {
      throw new Error('Must be logged in to delete receipts');
    }

    try {
      await dynamoDb.deleteReceipt(currentUser.uid, receiptId);
      setReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
    } catch (err) {
      console.error('Error deleting receipt:', err);
      throw err;
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

        setReceipts(receiptsData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error refreshing receipts:', err);
        if (mounted) {
          setError('Failed to refresh receipts');
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
