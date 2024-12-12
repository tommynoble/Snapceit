import express from 'express';
import cors from 'cors';
import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add test endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.json({ message: 'Receipt Scanner API is running!' });
});

const textract = new TextractClient({
  region: process.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

app.post('/api/scan-receipt', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      console.error('No image URL provided');
      return res.status(400).json({ error: 'No image URL provided' });
    }

    console.log('Processing receipt from:', imageUrl);

    // Extract S3 bucket and key from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucket = url.hostname.split('.')[0];
    const key = pathParts.slice(1).join('/');

    const params = {
      Document: {
        S3Object: {
          Bucket: bucket,
          Name: key
        }
      }
    };

    console.log('Calling Textract with params:', JSON.stringify(params, null, 2));

    const command = new AnalyzeExpenseCommand(params);
    
    try {
      const response = await textract.send(command);
      console.log('Textract response:', JSON.stringify(response, null, 2));

      // Process Textract response
      const receipt = {
        merchant: '',
        date: '',
        total: 0,
        items: []
      };

      // Extract information from Textract response
      response.ExpenseDocuments?.[0]?.SummaryFields?.forEach(field => {
        if (field.Type?.Text === 'VENDOR_NAME') {
          receipt.merchant = field.ValueDetection?.Text || '';
        } else if (field.Type?.Text === 'INVOICE_RECEIPT_DATE') {
          receipt.date = field.ValueDetection?.Text || '';
        } else if (field.Type?.Text === 'TOTAL') {
          receipt.total = parseFloat(field.ValueDetection?.Text || '0');
        }
      });

      // Extract line items
      response.ExpenseDocuments?.[0]?.LineItemGroups?.[0]?.LineItems?.forEach(item => {
        const lineItem = {
          description: '',
          quantity: 1,
          price: 0
        };

        item.LineItemExpenseFields?.forEach(field => {
          if (field.Type?.Text === 'ITEM') {
            lineItem.description = field.ValueDetection?.Text || '';
          } else if (field.Type?.Text === 'QUANTITY') {
            lineItem.quantity = parseInt(field.ValueDetection?.Text || '1');
          } else if (field.Type?.Text === 'PRICE') {
            lineItem.price = parseFloat(field.ValueDetection?.Text || '0');
          }
        });

        receipt.items.push(lineItem);
      });

      res.json(receipt);
    } catch (textractError) {
      console.error('Textract error:', textractError);
      throw textractError;
    }
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
