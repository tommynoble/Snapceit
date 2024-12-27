import { TextractClient, AnalyzeExpenseCommand, AnalyzeExpenseCommandOutput } from "@aws-sdk/client-textract";

interface ReceiptData {
    merchant: string;
    date: Date | null;
    total: number;
    tax: number;
    items: Array<{
        name: string;
        quantity?: number;
        price: number;
    }>;
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
        try {
            const result: ReceiptData = {
                merchant: '',
                date: null,
                total: 0,
                tax: 0,
                items: [],
                rawData: response
            };

            // Process expense fields
            response.ExpenseDocuments?.[0]?.SummaryFields?.forEach(field => {
                if (!field.Type?.Text || !field.ValueDetection?.Text) return;

                switch (field.Type.Text) {
                    case 'VENDOR_NAME':
                        result.merchant = field.ValueDetection.Text;
                        break;
                    case 'INVOICE_RECEIPT_DATE':
                        result.date = new Date(field.ValueDetection.Text);
                        break;
                    case 'TOTAL':
                        result.total = parseFloat(field.ValueDetection.Text) || 0;
                        break;
                    case 'TAX':
                        result.tax = parseFloat(field.ValueDetection.Text) || 0;
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
