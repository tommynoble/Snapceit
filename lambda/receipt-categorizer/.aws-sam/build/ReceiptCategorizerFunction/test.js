"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
async function addTestReceipt() {
    const testReceipt = {
        receiptId: `test-${Date.now()}`,
        userId: 'test-user',
        merchantName: 'Walmart Superstore',
        total: 156.78,
        date: new Date().toISOString(),
        items: [
            { name: 'Groceries', price: 45.99 },
            { name: 'Electronics', price: 110.79 }
        ],
        status: 'pending',
        rawText: `Walmart Superstore
123 Main Street
New York, NY 10001
Date: ${new Date().toLocaleDateString()}
---------------------------
Groceries        $45.99
Electronics      $110.79
---------------------------
Subtotal:        $156.78
Tax (8%):        $12.54
Total:           $169.32
Thank you for shopping at Walmart!`
    };
    try {
        await docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: 'receipts-dev',
            Item: testReceipt
        }));
        console.log('Test receipt added successfully!');
        console.log('Receipt ID:', testReceipt.receiptId);
    }
    catch (error) {
        console.error('Error adding test receipt:', error);
    }
}
addTestReceipt();
//# sourceMappingURL=test.js.map