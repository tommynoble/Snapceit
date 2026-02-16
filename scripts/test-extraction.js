
const AMOUNT_PATTERN = /(?:^|[\s$€£¥A-Za-z.]+)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+[.,]\d{2})\b/;

function parseAmount(raw) {
    if (!raw) return null;
    const match = raw.match(AMOUNT_PATTERN);
    if (!match) return null;

    // The capture group (match[1]) contains just the number part
    const numericPart = match[1];

    // Clean it up (handle 1.000,00 vs 1,000.00)
    const numeric = numericPart.replace(/[^\d.,]/g, '');

    const decimalMatch = numeric.match(/[.,](\d{2})$/);
    const decimalSep = decimalMatch ? decimalMatch[0][0] : null;
    const thousandSep = decimalSep === '.' ? ',' : decimalSep === ',' ? '.' : '';

    const withoutThousands = thousandSep ? numeric.replace(new RegExp(`\\${thousandSep}`, 'g'), '') : numeric;
    const normalized = decimalSep ? withoutThousands.replace(decimalSep, '.') : withoutThousands;

    return parseFloat(normalized);
}

// Test Cases
const testCases = [
    'GHC115.00',
    'GHC 115.00',
    '$94.46',
    'Total: USD 1,200.50',
    'EUR 50,00',
    'NGN 5,000.00',  // Nigerian Naira
    'R 150.00',      // South African Rand
    '¥2000.00',      // Japanese Yen (if formatted with decimals)
    'Balance: 115.00'
];

console.log('Testing Universal Currency Extraction:');
testCases.forEach(input => {
    console.log(`${input} -> ${parseAmount(input)}`);
});
