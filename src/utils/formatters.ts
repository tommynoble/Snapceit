export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Smart number parser that handles different number formats including:
 * - Numbers with commas as decimal separators (European format)
 * - Numbers with periods as decimal separators (US format)
 * - Numbers with thousand separators
 * - Numbers without any decimal separator (e.g., "65700" meaning "657.00")
 * - Currency symbols
 * - Whitespace
 */
export function parseNumber(value: string): number {
  if (!value) return 0;

  // Remove currency symbols and whitespace
  let cleanValue = value.replace(/[$€£¥]|\s/g, '');

  // Detect format
  const hasCommaDecimal = /\d+,\d{2}$/.test(cleanValue);
  const hasPeriodThousands = /\d{1,3}(\.\d{3})+,\d{2}$/.test(cleanValue);
  const isWholeNumber = /^\d+$/.test(cleanValue);

  if (hasCommaDecimal) {
    if (hasPeriodThousands) {
      // European format: 1.234,56
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else {
      // Simple comma as decimal: 1234,56
      cleanValue = cleanValue.replace(',', '.');
    }
  } else if (isWholeNumber && cleanValue.length > 2) {
    // Handle cases where decimal point is omitted (e.g., "65700" meaning "657.00")
    // Only apply this logic if the number is longer than 2 digits
    const lastTwoDigits = cleanValue.slice(-2);
    const otherDigits = cleanValue.slice(0, -2);
    cleanValue = `${otherDigits}.${lastTwoDigits}`;
  }

  // Remove any remaining non-numeric characters except decimal point
  cleanValue = cleanValue.replace(/[^\d.-]/g, '');

  const number = parseFloat(cleanValue);
  return isNaN(number) ? 0 : number;
}
