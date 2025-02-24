import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

dotenv.config();

interface LineItem {
  name: string;
  quantity?: number;
  price: number;
}

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure DynamoDB client with removeUndefinedValues
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
}), {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

async function testTextract() {
  try {
    // Call Textract directly
    const command = new AnalyzeExpenseCommand({
      Document: {
        S3Object: {
          Bucket: 'snapceit-receipts-dev',
          Name: 'Grocery-Sample-Receipts-6a54382fcf73a5020837f5360ab5a57b.png'
        }
      }
    });

    console.log('Analyzing receipt with Textract...');
    const response = await textractClient.send(command);
    
    // Log raw Textract response
    console.log('Raw Textract Response:', JSON.stringify(response, null, 2));
    
    // Log document structure
    console.log('\nDocument Structure:');
    console.log('- Number of expense documents:', response.ExpenseDocuments?.length);
    response.ExpenseDocuments?.forEach((doc, i) => {
      console.log(`\nDocument ${i + 1}:`);
      console.log('- Summary Fields:', doc.SummaryFields?.length);
      console.log('- Line Item Groups:', doc.LineItemGroups?.length);
      doc.LineItemGroups?.forEach((group, j) => {
        console.log(`  Group ${j + 1}:`);
        console.log('  - Line Items:', group.LineItems?.length);
      });
    });
    
    // Parse the response
    const result = {
      merchant: '',
      date: null as string | null,
      total: 0,
      tax: 0,
      subtotal: 0,
      items: [] as LineItem[],
      rawText: [] as string[]  // We'll collect all text for better categorization
    };

    // Process expense fields
    response.ExpenseDocuments?.[0]?.SummaryFields?.forEach(field => {
      if (!field.Type?.Text || !field.ValueDetection?.Text) return;

      // Add to raw text for categorization
      result.rawText.push(field.ValueDetection.Text);

      // Parse numeric values, removing currency symbols and converting to float
      const numericValue = field.ValueDetection.Text.replace(/[^0-9.-]/g, '');

      switch (field.Type.Text) {
        case 'VENDOR_NAME':
          result.merchant = field.ValueDetection.Text;
          break;
        case 'INVOICE_RECEIPT_DATE':
          result.date = field.ValueDetection.Text;
          break;
        case 'TOTAL':
          result.total = parseFloat(numericValue) || 0;
          break;
        case 'TAX':
          result.tax = parseFloat(numericValue) || 0;
          break;
        case 'SUBTOTAL':
          result.subtotal = parseFloat(numericValue) || 0;
          break;
      }
    });

    // Process line items
    response.ExpenseDocuments?.[0]?.LineItemGroups?.forEach(group => {
      group.LineItems?.forEach(item => {
        const lineItem: LineItem = {
          name: '',
          price: 0,
          quantity: undefined
        };

        item.LineItemExpenseFields?.forEach(field => {
          if (!field.Type?.Text || !field.ValueDetection?.Text) return;

          // Add to raw text for categorization
          result.rawText.push(field.ValueDetection.Text);

          // Parse numeric values, removing currency symbols
          const numericValue = field.ValueDetection.Text.replace(/[^0-9.-]/g, '');

          switch (field.Type.Text) {
            case 'ITEM':
              lineItem.name = field.ValueDetection.Text;
              break;
            case 'QUANTITY':
              lineItem.quantity = parseFloat(numericValue) || undefined;
              break;
            case 'PRICE':
              lineItem.price = parseFloat(numericValue) || 0;
              break;
          }
        });

        if (lineItem.name && lineItem.price) {
          result.items.push(lineItem);
        }
      });
    });

    console.log('\nParsed Receipt Data:', JSON.stringify(result, null, 2));

    // Save to DynamoDB
    const putCommand = new PutCommand({
      TableName: 'receipts-dev',
      Item: {
        userId: 'test-user',
        receiptId: `test-${Date.now()}`,
        merchantName: result.merchant,
        items: result.items.map(item => ({
          description: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: result.total,
        tax: result.tax,
        subtotal: result.subtotal,
        date: result.date || new Date().toISOString(),
        status: 'pending',
        // Join all text elements for better categorization
        rawText: result.rawText.join(' ')
      }
    });

    await dynamodb.send(putCommand);
    console.log('\nReceipt saved to DynamoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

testTextract();
