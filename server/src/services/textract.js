import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";

class TextractService {
    constructor() {
        this.client = new TextractClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }

    async analyzeReceipt(s3Bucket, s3Key) {
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
        } catch (error) {
            console.error('Textract Analysis Error:', error);
            throw new Error(`Failed to analyze receipt: ${error.message}`);
        }
    }

    parseTextractResponse(response) {
        try {
            const result = {
                merchant: '',
                date: null,
                total: 0,
                tax: 0,
                items: [],
                rawData: response
            };

            // Process expense fields
            response.ExpenseDocuments?.[0]?.SummaryFields?.forEach(field => {
                switch (field.Type.Text) {
                    case 'VENDOR_NAME':
                        result.merchant = field.ValueDetection.Text;
                        break;
                    case 'INVOICE_RECEIPT_DATE':
                        result.date = new Date(field.ValueDetection.Text);
                        break;
                    case 'TOTAL':
                        result.total = parseFloat(field.ValueDetection.Text.replace(/[^0-9.-]+/g, ''));
                        break;
                    case 'TAX':
                        result.tax = parseFloat(field.ValueDetection.Text.replace(/[^0-9.-]+/g, ''));
                        break;
                }
            });

            // Process line items
            response.ExpenseDocuments?.[0]?.LineItemGroups?.forEach(group => {
                group.LineItems?.forEach(lineItem => {
                    const item = {
                        description: '',
                        quantity: 1,
                        price: 0
                    };

                    lineItem.LineItemExpenseFields?.forEach(field => {
                        switch (field.Type.Text) {
                            case 'ITEM':
                                item.description = field.ValueDetection.Text;
                                break;
                            case 'QUANTITY':
                                item.quantity = parseFloat(field.ValueDetection.Text);
                                break;
                            case 'PRICE':
                                item.price = parseFloat(field.ValueDetection.Text.replace(/[^0-9.-]+/g, ''));
                                break;
                        }
                    });

                    if (item.description) {
                        result.items.push(item);
                    }
                });
            });

            return result;
        } catch (error) {
            console.error('Error parsing Textract response:', error);
            throw new Error('Failed to parse receipt data');
        }
    }

    // Helper method to extract S3 bucket and key from URL
    static getS3Details(s3Url) {
        try {
            const url = new URL(s3Url);
            const bucket = url.hostname.split('.')[0];
            const key = url.pathname.substring(1); // Remove leading slash
            return { bucket, key };
        } catch (error) {
            throw new Error('Invalid S3 URL format');
        }
    }
}

export default new TextractService();
