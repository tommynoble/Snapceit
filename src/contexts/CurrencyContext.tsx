import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../auth/CognitoAuthContext';
import toast from 'react-hot-toast';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  formatAmount: (amount: number) => string;
  loading: boolean;
  state?: string;
  setState: (state: string) => Promise<void>;
}

export const currencySymbols: Record<string, string> = {
  USD: '$', // United States Dollar
  EUR: '€', // Euro
  GBP: '£', // British Pound Sterling
  JPY: '¥', // Japanese Yen
  AUD: 'A$', // Australian Dollar
  CAD: 'C$', // Canadian Dollar
  CHF: 'CHF', // Swiss Franc
  CNY: '¥', // Chinese Yuan
  HKD: 'HK$', // Hong Kong Dollar
  NZD: 'NZ$', // New Zealand Dollar
  SEK: 'kr', // Swedish Krona
  KRW: '₩', // South Korean Won
  SGD: 'S$', // Singapore Dollar
  NOK: 'kr', // Norwegian Krone
  MXN: '$', // Mexican Peso
  INR: '₹', // Indian Rupee
  RUB: '₽', // Russian Ruble
  ZAR: 'R', // South African Rand
  TRY: '₺', // Turkish Lira
  BRL: 'R$', // Brazilian Real
  TWD: 'NT$', // New Taiwan Dollar
  DKK: 'kr', // Danish Krone
  PLN: 'zł', // Polish Złoty
  THB: '฿', // Thai Baht
  IDR: 'Rp', // Indonesian Rupiah
  HUF: 'Ft', // Hungarian Forint
  CZK: 'Kč', // Czech Koruna
  ILS: '₪', // Israeli New Shekel
  CLP: 'CLP', // Chilean Peso
  PHP: '₱', // Philippine Peso
  AED: 'د.إ', // UAE Dirham
  COP: 'COP', // Colombian Peso
  SAR: '﷼', // Saudi Riyal
  MYR: 'RM', // Malaysian Ringgit
  RON: 'lei', // Romanian Leu
  NGN: '₦', // Nigerian Naira
  GHS: '₵', // Ghanaian Cedi
  EGP: 'E£', // Egyptian Pound
  PKR: '₨', // Pakistani Rupee
  KES: 'KSh', // Kenyan Shilling
  VND: '₫', // Vietnamese Dong
  UAH: '₴', // Ukrainian Hryvnia
  ARS: 'ARS', // Argentine Peso
  BDT: '৳', // Bangladeshi Taka
  MAD: 'د.م.', // Moroccan Dirham
  QAR: 'ر.ق', // Qatari Riyal
  KWD: 'د.ك', // Kuwaiti Dinar
  JOD: 'د.ا', // Jordanian Dinar
  BHD: '.د.ب', // Bahraini Dinar
  OMR: 'ر.ع.', // Omani Rial
  DZD: 'د.ج', // Algerian Dinar
  TND: 'د.ت', // Tunisian Dinar
  LBP: 'ل.ل', // Lebanese Pound
  JMD: 'J$', // Jamaican Dollar
  XOF: 'CFA', // West African CFA Franc
  XAF: 'FCFA', // Central African CFA Franc
  UGX: 'USh', // Ugandan Shilling
  TZS: 'TSh', // Tanzanian Shilling
  RWF: 'FRw', // Rwandan Franc
  ETB: 'Br', // Ethiopian Birr
  UYU: 'UYU', // Uruguayan Peso
  PEN: 'S/', // Peruvian Sol
  BOB: 'Bs.', // Bolivian Boliviano
  PYG: '₲', // Paraguayan Guarani
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: async () => {},
  formatAmount: (amount: number) => '',
  loading: false,
  state: undefined,
  setState: async () => {}
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [currency, setCurrencyState] = useState('USD');
  const [state, setStateValue] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (currentUser?.idToken) {
        try {
          setLoading(true);
          const settings = await api.settings.getSettings(currentUser.idToken);
          setCurrencyState(settings.currency || 'USD');
          setStateValue(settings.state);
        } catch (error) {
          console.error('Error loading settings:', error);
          toast.error('Failed to load currency settings');
        } finally {
          setLoading(false);
        }
      }
    };

    loadSettings();
  }, [currentUser]);

  const formatAmount = useCallback((amount: number) => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount);
  }, [currency]);

  const setCurrency = async (newCurrency: string) => {
    if (!currentUser?.idToken) return;

    try {
      setLoading(true);
      await api.settings.updateCurrency(newCurrency, currentUser.idToken);
      setCurrencyState(newCurrency);
      
      // Clear state if not USD
      if (newCurrency !== 'USD') {
        setStateValue(undefined);
        await api.settings.updateState(undefined, currentUser.idToken);
      }
      
      toast.success('Currency updated successfully');
    } catch (error) {
      console.error('Error updating currency:', error);
      toast.error('Failed to update currency');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setState = async (newState: string) => {
    if (!currentUser?.idToken || currency !== 'USD') return;

    try {
      setLoading(true);
      await api.settings.updateState(newState, currentUser.idToken);
      setStateValue(newState);
      toast.success('State updated successfully');
    } catch (error) {
      console.error('Error updating state:', error);
      toast.error('Failed to update state');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, loading, state, setState }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

// Helper function to get currency name
export function getCurrencyName(code: string): string {
  const currencyNames: { [key: string]: string } = {
    USD: 'United States Dollar',
    EUR: 'Euro',
    GBP: 'British Pound Sterling',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    HKD: 'Hong Kong Dollar',
    NZD: 'New Zealand Dollar',
    SEK: 'Swedish Krona',
    KRW: 'South Korean Won',
    SGD: 'Singapore Dollar',
    NOK: 'Norwegian Krone',
    MXN: 'Mexican Peso',
    INR: 'Indian Rupee',
    RUB: 'Russian Ruble',
    ZAR: 'South African Rand',
    TRY: 'Turkish Lira',
    BRL: 'Brazilian Real',
    TWD: 'New Taiwan Dollar',
    DKK: 'Danish Krone',
    PLN: 'Polish Złoty',
    THB: 'Thai Baht',
    IDR: 'Indonesian Rupiah',
    HUF: 'Hungarian Forint',
    CZK: 'Czech Koruna',
    ILS: 'Israeli New Shekel',
    CLP: 'Chilean Peso',
    PHP: 'Philippine Peso',
    AED: 'UAE Dirham',
    COP: 'Colombian Peso',
    SAR: 'Saudi Riyal',
    MYR: 'Malaysian Ringgit',
    RON: 'Romanian Leu',
    NGN: 'Nigerian Naira',
    GHS: 'Ghanaian Cedi',
    EGP: 'Egyptian Pound',
    PKR: 'Pakistani Rupee',
    KES: 'Kenyan Shilling',
    VND: 'Vietnamese Dong',
    UAH: 'Ukrainian Hryvnia',
    ARS: 'Argentine Peso',
    BDT: 'Bangladeshi Taka',
    MAD: 'Moroccan Dirham',
    QAR: 'Qatari Riyal',
    KWD: 'Kuwaiti Dinar',
    JOD: 'Jordanian Dinar',
    BHD: 'Bahraini Dinar',
    OMR: 'Omani Rial',
    DZD: 'Algerian Dinar',
    TND: 'Tunisian Dinar',
    LBP: 'Lebanese Pound',
    JMD: 'Jamaican Dollar',
    XOF: 'West African CFA Franc',
    XAF: 'Central African CFA Franc',
    UGX: 'Ugandan Shilling',
    TZS: 'Tanzanian Shilling',
    RWF: 'Rwandan Franc',
    ETB: 'Ethiopian Birr',
    UYU: 'Uruguayan Peso',
    PEN: 'Peruvian Sol',
    BOB: 'Bolivian Boliviano',
    PYG: 'Paraguayan Guarani',
  };
  return currencyNames[code] || code;
}
