import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const textract = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post('/api/scan-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const params = {
      Document: {
        Bytes: req.file.buffer
      }
    };

    const command = new AnalyzeExpenseCommand(params);
    const response = await textract.send(command);

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
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
