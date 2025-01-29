import { useCurrency as useContextCurrency } from '../contexts/CurrencyContext';

export function useCurrency() {
  const { currency, formatAmount } = useContextCurrency();

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '-';
    return formatAmount(amount);
  };

  return { formatCurrency, currency };
}
