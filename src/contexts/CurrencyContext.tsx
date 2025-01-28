import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/CognitoAuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  formatAmount: (amount: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$'
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!currentUser?.idToken) {
          setLoading(false);
          return;
        }

        const settings = await api.settings.getSettings(currentUser.idToken);
        setCurrencyState(settings.currency || 'USD');
      } catch (error) {
        console.error('Error loading currency settings:', error);
        toast.error('Failed to load currency settings');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const setCurrency = async (newCurrency: string) => {
    try {
      setLoading(true);
      if (!currentUser?.idToken) throw new Error('No auth token');

      await api.settings.updateCurrency(newCurrency, currentUser.idToken);
      setCurrencyState(newCurrency);
      toast.success('Currency updated successfully');
    } catch (error) {
      console.error('Error updating currency:', error);
      toast.error('Failed to update currency');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (!amount && amount !== 0) return currencySymbols[currency] + '0.00';
    
    const symbol = currencySymbols[currency] || '$';
    
    // Special handling for JPY which doesn't use decimal places
    if (currency === 'JPY') {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
