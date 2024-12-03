import React, { createContext, useContext, useState, useCallback } from 'react';

interface Receipt {
  id: number;
  date: string;
  amount: number;
  merchant: string;
  category: string;
  status: 'processing' | 'completed' | 'failed';
  preview?: string;
}

interface ReceiptContextType {
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  deleteReceipt: (id: number) => void;
  updateReceipt: (id: number, data: Partial<Receipt>) => void;
  downloadReceipt: (id: number) => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: React.ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([
    { 
      id: 1, 
      date: 'July 23', 
      amount: 221, 
      merchant: 'Chicken Republic',
      category: 'Food & Dining',
      status: 'completed'
    },
    { 
      id: 2, 
      date: 'July 23', 
      amount: 332, 
      merchant: 'Chicken Republic',
      category: 'Food & Dining',
      status: 'completed'
    },
  ]);

  const addReceipt = useCallback((receipt: Omit<Receipt, 'id'>) => {
    setReceipts(prev => [
      {
        ...receipt,
        id: Math.max(0, ...prev.map(r => r.id)) + 1,
      },
      ...prev,
    ]);
  }, []);

  const updateReceipt = useCallback((id: number, data: Partial<Receipt>) => {
    setReceipts(prev => prev.map(receipt => 
      receipt.id === id ? { ...receipt, ...data } : receipt
    ));
  }, []);

  const deleteReceipt = useCallback((id: number) => {
    setReceipts(prev => prev.filter(receipt => receipt.id !== id));
  }, []);

  const downloadReceipt = useCallback((id: number) => {
    const receipt = receipts.find(r => r.id === id);
    if (!receipt) return;

    // Create receipt content
    const content = `
Receipt Details
--------------
Date: ${receipt.date}
Merchant: ${receipt.merchant}
Amount: $${receipt.amount.toFixed(2)}
Category: ${receipt.category}
    `.trim();

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [receipts]);

  return (
    <ReceiptContext.Provider value={{ 
      receipts, 
      addReceipt, 
      deleteReceipt, 
      updateReceipt,
      downloadReceipt 
    }}>
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