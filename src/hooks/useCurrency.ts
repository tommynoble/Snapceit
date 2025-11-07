import { useCallback } from 'react';
import { useSettings } from './useSettings';

export function useCurrency() {
  const { settings, loading } = useSettings();
  
  const formatCurrency = useCallback((amount: number) => {
    // Default values while loading or if settings are not available
    const currency = settings?.currency || 'USD';
    const language = settings?.language || 'en-US';

    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, [settings?.currency, settings?.language]);

  return { formatCurrency };
}
