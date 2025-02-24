import { TextractClient, AnalyzeExpenseCommand, AnalyzeExpenseCommandOutput } from "@aws-sdk/client-textract";

interface Address {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

interface ReceiptData {
    merchant: string;
    merchantAddress?: Address;
    date: Date | null;
    total: number;
    tax?: {
        total: number;
        rate?: number;
    };
    items: Array<{
        name: string;
        quantity?: number;
        price: number;
    }>;
    state?: string;
    category?: string;
    businessCategory?: string;
    taxDeductible?: boolean;
    taxDetails?: {
        businessPurpose?: string;
        deductiblePercentage?: number;
        notes?: string;
    };
    categoryConfidence?: number;
    rawData: AnalyzeExpenseCommandOutput;
}

class TextractService {
    private client: TextractClient;

    constructor() {
        this.client = new TextractClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }

    async analyzeReceipt(s3Bucket: string, s3Key: string): Promise<ReceiptData> {
        try {
            const command = new AnalyzeExpenseCommand({
                Document: {
                    S3Object: {
                        Bucket: s3Bucket,
                        Name: s3Key
                    }
                }
            });

            const response = await this.client.send(command);
            return this.parseTextractResponse(response);
        } catch (err) {
            const error = err as Error;
            console.error('Textract Analysis Error:', error);
            throw new Error(`Failed to analyze receipt: ${error.message}`);
        }
    }

    private parseTextractResponse(response: AnalyzeExpenseCommandOutput): ReceiptData {
        const findMerchantName = (response: AnalyzeExpenseCommandOutput): string => {
            // First look at the first few lines with large width (logos/headers)
            const prominentLines = response.ExpenseDocuments?.[0]?.Blocks
                ?.filter(block => 
                    block.BlockType === 'LINE' && 
                    block.Geometry?.BoundingBox?.Width && 
                    block.Geometry.BoundingBox.Width > 0.3 &&
                    block.Geometry.BoundingBox.Top < 0.2 && // Only look at top of receipt
                    block.Text && 
                    !/^(TOTAL|SUBTOTAL|DATE|TIME|ORDER|\d)/.test(block.Text)
                )
                .sort((a, b) => 
                    (a.Geometry?.BoundingBox?.Top || 0) - (b.Geometry?.BoundingBox?.Top || 0)
                );

            if (prominentLines && prominentLines.length > 0) {
                return prominentLines[0].Text || '';
            }

            // Fallback to vendor name field
            const vendorField = response.ExpenseDocuments?.[0]?.SummaryFields?.find(field => 
                field.Type?.Text?.match(/VENDOR|MERCHANT|SUPPLIER|BUSINESS/)
            );

            return vendorField?.ValueDetection?.Text || 'Unknown Merchant';
        };

        const findTaxAmount = (response: AnalyzeExpenseCommandOutput): number => {
            // First look for lines containing 'TAX' followed by an amount
            const taxLines = response.ExpenseDocuments?.[0]?.Blocks
                ?.filter(block => 
                    block.BlockType === 'LINE' && 
                    block.Text && 
                    block.Text.toUpperCase().includes('TAX')
                );

            for (const line of taxLines || []) {
                const match = line.Text?.match(/TAX[\s:]*\$?(\d+\.?\d*)/i);
                if (match && match[1]) {
                    return parseFloat(match[1]);
                }
            }

            // Fallback to tax field
            const taxField = response.ExpenseDocuments?.[0]?.SummaryFields?.find(field => 
                field.Type?.Text?.match(/TAX(?!_RATE|_PAYER)/i)
            );

            if (taxField?.ValueDetection?.Text) {
                const amount = taxField.ValueDetection.Text.replace(/[^0-9.]/g, '');
                return parseFloat(amount) || 0;
            }

            return 0;
        };
        const extractMerchantName = (text: string): string => {
            return text.replace(/\s+(restaurant|cafe|inc\.?|llc\.?|ltd\.?)\s*$/i, '').trim();
        };

        const extractTaxAmount = (text: string): number => {
            // Look for amount after 'TAX' keyword
            const match = text.match(/TAX[\s:]*\$?(\d+\.?\d*)/i);
            if (match && match[1]) {
                return parseFloat(match[1]);
            }
            // If no match, try to extract any number
            const numMatch = text.match(/(\d+\.?\d*)/); 
            return numMatch ? parseFloat(numMatch[1]) : 0;
        };

        const isMerchantText = (text: string, confidence?: number): boolean => {
            // Check if text is likely a merchant name based on properties
            return text.length > 2 && // More than 2 characters
                   /[A-Z]/.test(text) && // Contains uppercase
                   !/^(TOTAL|SUBTOTAL|DATE|TIME|ORDER|\d)/.test(text) && // Not a header
                   (!confidence || confidence > 90); // High confidence if provided
        };
        const extractMerchantName = (text: string): string => {
            // Clean up common suffixes and prefixes
            return text.replace(/\s+(restaurant|cafe|inc\.?|llc\.?|ltd\.?)\s*$/i, '')
                      .trim();
        };
        try {
            const result: ReceiptData = {
                merchant: findMerchantName(response),
                date: null,
                total: 0,
                tax: {
                    total: findTaxAmount(response)
                },
                items: [],
                rawData: response
            };

            // Process remaining fields

            // Process expense fields
            response.ExpenseDocuments?.[0]?.SummaryFields?.forEach(field => {
                if (!field.Type?.Text || !field.ValueDetection?.Text) return;

                // Skip merchant name and tax fields since they're handled by findMerchantName and findTaxAmount
                switch (field.Type.Text.toUpperCase()) {
                    case 'VENDOR_NAME':
                    case 'MERCHANT_NAME':
                    case 'SUPPLIER_NAME':
                    case 'BUSINESS_NAME':
                    case 'SIGNATURE':
                    case 'OTHER':
                        const merchantText = extractMerchantName(field.ValueDetection.Text);
                        if (merchantText && merchantText.length > 2) { // Avoid single characters
                            if (!result.merchant) {
                                result.merchant = merchantText;
                            } else if (!result.possibleMerchantNames.includes(merchantText)) {
                                result.possibleMerchantNames.push(merchantText);
                            }
                        }
                        break;
                    case 'INVOICE_RECEIPT_DATE':
                        result.date = new Date(field.ValueDetection.Text);
                        break;
                    case 'TOTAL':
                        result.total = parseFloat(field.ValueDetection.Text) || 0;
                        break;
                    case 'TAX':
                    case 'SALES_TAX':
                    case 'TAX_AMOUNT':
                        const taxAmount = extractTaxAmount(field.ValueDetection.Text);
                        // Only update if we haven't found tax in raw text or if this amount is larger
                        if (!result.tax?.total || taxAmount > result.tax.total) {
                            result.tax = {
                                total: taxAmount
                            };
                        }
                        break;
                    case 'TAX_RATE':
                        if (result.tax) {
                            result.tax.rate = parseFloat(field.ValueDetection.Text) || undefined;
                        }
                        break;
                    case 'RECEIPT_TYPE':
                    case 'EXPENSE_TYPE':
                        // Store as potential category hint but don't set directly
                        // Will be processed by Comprehend later
                        result.category = field.ValueDetection.Text;
                        break;
                    case 'STATE':
                        result.state = field.ValueDetection.Text;
                        if (!result.merchantAddress) result.merchantAddress = {};
                        result.merchantAddress.state = field.ValueDetection.Text;
                        break;
                    case 'ADDRESS':
                        if (!result.merchantAddress) result.merchantAddress = {};
                        result.merchantAddress.street = field.ValueDetection.Text;
                        break;
                    case 'CITY':
                        if (!result.merchantAddress) result.merchantAddress = {};
                        result.merchantAddress.city = field.ValueDetection.Text;
                        break;
                    case 'ZIP_CODE':
                    case 'POSTAL_CODE':
                        if (!result.merchantAddress) result.merchantAddress = {};
                        result.merchantAddress.zipCode = field.ValueDetection.Text;
                        break;
                }
            });

            // Process line items
            response.ExpenseDocuments?.[0]?.LineItemGroups?.forEach(group => {
                group.LineItems?.forEach(item => {
                    const lineItem: { name: string; quantity?: number; price: number } = {
                        name: '',
                        price: 0
                    };

                    item.LineItemExpenseFields?.forEach(field => {
                        if (!field.Type?.Text || !field.ValueDetection?.Text) return;

                        switch (field.Type.Text) {
                            case 'ITEM':
                                lineItem.name = field.ValueDetection.Text;
                                break;
                            case 'QUANTITY':
                                lineItem.quantity = parseFloat(field.ValueDetection.Text) || undefined;
                                break;
                            case 'PRICE':
                                lineItem.price = parseFloat(field.ValueDetection.Text) || 0;
                                break;
                        }
                    });

                    if (lineItem.name && lineItem.price) {
                        result.items.push(lineItem);
                    }
                });
            });

            // If we have no merchant but have possible names, use the first one
            if (!result.merchant && result.possibleMerchantNames.length > 0) {
                result.merchant = result.possibleMerchantNames[0];
            }
            
            // If still no merchant, try to find it in the raw text
            if (!result.merchant) {
                const rawText = response.ExpenseDocuments?.[0]?.Pages?.[0]?.Lines
                    ?.slice(0, 5) // Look at first 5 lines only
                    ?.map(line => line.Text)
                    ?.join(' ') || '';
                
                const possibleNames = rawText.split(/[\n\r]/).filter(line => 
                    line.length > 2 && 
                    /[A-Z]/.test(line) && // Contains at least one uppercase letter
                    !/^(TOTAL|TAX|SUBTOTAL|DATE|TIME|ORDER|\d)/.test(line) // Not a common header
                );
                
                if (possibleNames.length > 0) {
                    result.merchant = extractMerchantName(possibleNames[0]);
                }
            }
            
            // Default if we still couldn't find anything
            if (!result.merchant) {
                result.merchant = 'Unknown Merchant';
            }
            
            return result;
        } catch (err) {
            const error = err as Error;
            console.error('Error parsing Textract response:', error);
            throw new Error(`Failed to parse receipt data: ${error.message}`);
        }
    }

    // Helper method to extract S3 bucket and key from URL
    static getS3Details(s3Url: string): { bucket: string; key: string } {
        try {
            const url = new URL(s3Url);
            const pathParts = url.pathname.split('/');
            return {
                bucket: url.hostname.split('.')[0],
                key: pathParts.slice(1).join('/')
            };
        } catch (error) {
            throw new Error('Invalid S3 URL format');
        }
    }
}

export default new TextractService();
