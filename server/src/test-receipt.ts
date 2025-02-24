import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { TextractClient, AnalyzeExpenseCommand } from '@aws-sdk/client-textract';
import * as fs from 'fs';
import * as path from 'path';

const s3Client = new S3Client({ region: 'us-east-1' });
const textractClient = new TextractClient({ region: 'us-east-1' });

async function processReceipt(imagePath: string) {
    const bucketName = 'snapceit-receipts-dev';
    const key = `test-receipts/${path.basename(imagePath)}`;
    
    try {
        // 1. Upload to S3
        console.log('Uploading to S3...');
        const fileContent = fs.readFileSync(imagePath);
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
            ContentType: 'image/jpeg'
        }));
        
        // 2. Process with Textract
        console.log('Processing with Textract...');
        const textractResponse = await textractClient.send(new AnalyzeExpenseCommand({
            Document: {
                S3Object: {
                    Bucket: bucketName,
                    Name: key
                }
            }
        }));
        
        // 3. Log the raw response for analysis
        console.log('Raw Textract Response:');
        console.log(JSON.stringify(textractResponse, null, 2));
        
        // 4. Log specific fields we're interested in
        console.log('\nExtracted Fields:');
        textractResponse.ExpenseDocuments?.[0]?.SummaryFields?.forEach(field => {
            console.log(`${field.Type?.Text}: ${field.ValueDetection?.Text}`);
        });
        
        // 5. Log Line Items
        console.log('\nLine Items:');
        textractResponse.ExpenseDocuments?.[0]?.LineItemGroups?.forEach(group => {
            group.LineItems?.forEach(item => {
                console.log('Item:');
                item.LineItemExpenseFields?.forEach(field => {
                    console.log(`  ${field.Type?.Text}: ${field.ValueDetection?.Text}`);
                });
            });
        });

        // 6. Log all detected text lines (for merchant name/logo detection)
        console.log('\nAll Text Lines:');
        textractResponse.ExpenseDocuments?.[0]?.Pages?.forEach(page => {
            page.Lines?.forEach(line => {
                const width = line.Geometry?.BoundingBox?.Width || 0;
                console.log(`[Width: ${width.toFixed(2)}] ${line.Text}`);
            });
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the test
const testImagePath = process.argv[2];
if (!testImagePath) {
    console.error('Please provide an image path as argument');
    process.exit(1);
}

processReceipt(testImagePath);
