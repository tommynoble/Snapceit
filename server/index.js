const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Rekognition } = require('@aws-sdk/client-rekognition');

const app = express();
const upload = multer();

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize Rekognition client
const rekognition = new Rekognition({
  region: process.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

app.post('/api/scan-receipt', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    // Here you would implement the actual receipt scanning logic
    // For now, we'll return mock data
    const mockReceiptData = {
      date: new Date().toLocaleDateString(),
      total: Math.random() * 100,
      merchant: 'Sample Merchant',
      items: [
        { name: 'Item 1', price: 10.99 },
        { name: 'Item 2', price: 15.99 }
      ]
    };

    res.json(mockReceiptData);
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
