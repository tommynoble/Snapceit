import { dynamoDb } from './dynamodb';

export async function testDynamoDBConnection() {
  try {
    console.log('Testing DynamoDB connection...');

    const testReceipt = {
      userId: 'test-user',
      receiptId: 'test-receipt-1',
      merchantName: 'Test Store',
      date: new Date().toISOString(),
      total: 99.99,
      tax: {
        total: 8.99,
        breakdown: {
          salesTax: 8.99
        }
      },
      items: [
        {
          description: 'Test Item 1',
          price: 49.99
        },
        {
          description: 'Test Item 2',
          price: 50.00
        }
      ],
      category: 'Test',
      createdAt: new Date().toISOString()
    };

    // Add test receipt
    try {
      await dynamoDb.putReceipt(testReceipt);
      console.log('Test receipt added successfully');
    } catch (error) {
      console.error('Error adding test receipt:', error);
      if (error instanceof Error) {
        if (error.message.includes('credentials')) {
          console.error('❌ AWS Credentials error. Please check your .env.local file has the correct credentials.');
        } else if (error.message.includes('network')) {
          console.error('❌ Network error. Please check your internet connection.');
        }
      }
      throw error;
    }

    // Query the receipt
    try {
      const receipts = await dynamoDb.queryReceipts('test-user');
      console.log('Retrieved receipts:', receipts);
      return receipts;
    } catch (error) {
      console.error('Error querying receipts:', error);
      if (error instanceof Error) {
        if (error.message.includes('credentials')) {
          console.error('❌ AWS Credentials error. Please check your .env.local file has the correct credentials.');
        } else if (error.message.includes('network')) {
          console.error('❌ Network error. Please check your internet connection.');
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error testing DynamoDB:', error);
    throw error;
  }
}
