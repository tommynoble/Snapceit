import { TextractClient, AnalyzeExpenseCommand, AnalyzeExpenseCommandOutput, ExpenseField, LineItemFields } from "@aws-sdk/client-textract";

const textractClient = new TextractClient({ region: 'us-east-1' });

async function processExistingReceipt() {
    const bucketName = 'snapceit-receipts-dev';
    const key = 'Grocery-Sample-Receipts-6a54382fcf73a5020837f5360ab5a57b.png';
    
    try {
        // Process with Textract
        console.log('Processing receipt from S3:', key);
        const textractResponse = await textractClient.send(new AnalyzeExpenseCommand({
            Document: {
                S3Object: {
                    Bucket: bucketName,
                    Name: key
                }
            }
        }));
        
        // Log raw response for analysis
        console.log('\nRaw Textract Response:');
        console.log(JSON.stringify(textractResponse, null, 2));
        
        // Log all fields for analysis
        console.log('\nAll Fields:');
        textractResponse.ExpenseDocuments?.[0]?.SummaryFields?.forEach((field: ExpenseField) => {
            if (field.Type?.Text && field.ValueDetection?.Text) {
                console.log(`${field.Type.Text}: ${field.ValueDetection.Text}`);
            }
        });

        // Log tax-related fields
        console.log('\nTax Fields:');
        textractResponse.ExpenseDocuments?.[0]?.SummaryFields?.forEach((field: ExpenseField) => {
            if (field.Type?.Text?.toUpperCase().includes('TAX') && field.ValueDetection?.Text) {
                console.log(`${field.Type.Text}: ${field.ValueDetection.Text}`);
            }
        });

        // Log merchant-related fields
        console.log('\nMerchant Fields:');
        textractResponse.ExpenseDocuments?.[0]?.SummaryFields?.forEach((field: ExpenseField) => {
            if (field.Type?.Text?.match(/VENDOR|MERCHANT|SUPPLIER|BUSINESS/) && field.ValueDetection?.Text) {
                console.log(`${field.Type.Text}: ${field.ValueDetection.Text}`);
            }
        });
        
        // Log line items
        console.log('\nLine Items:');
        textractResponse.ExpenseDocuments?.[0]?.LineItemGroups?.forEach(group => {
            group.LineItems?.forEach(item => {
                console.log('Item:');
                item.LineItemExpenseFields?.forEach((field: ExpenseField) => {
                    if (field.Type?.Text && field.ValueDetection?.Text) {
                        console.log(`  ${field.Type.Text}: ${field.ValueDetection.Text}`);
                    }
                });
            });
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the process
processExistingReceipt();
