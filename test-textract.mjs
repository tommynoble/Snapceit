import TextractService from './server/src/services/textract.js';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const dynamodb = DynamoDBDocumentClient.from(client);

async function testTextract() {
  try {
    // Analyze receipt with Textract
    const receiptData = await TextractService.analyzeReceipt(
      'snapceit-receipts-dev',
      'Grocery-Sample-Receipts-6a54382fcf73a5020837f5360ab5a57b.png'
    );
    
    console.log('Textract Analysis Result:', JSON.stringify(receiptData, null, 2));

    // Save to DynamoDB
    const command = new PutCommand({
      TableName: 'receipts-dev',
      Item: {
        userId: 'test-user',
        receiptId: `test-${Date.now()}`,
        merchantName: receiptData.merchant,
        items: receiptData.items.map(item => ({
          description: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: receiptData.total,
        tax: receiptData.tax,
        date: new Date().toISOString(),
        status: 'pending'
      }
    });

    await dynamodb.send(command);
    console.log('Receipt saved to DynamoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

testTextract();
