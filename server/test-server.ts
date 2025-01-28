import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5184'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Basic endpoints for testing
app.get('/receipts', (req, res) => {
  res.json({ 
    message: 'This will list receipts', 
    items: [] 
  });
});

app.post('/upload-url', (req, res) => {
  res.json({ 
    message: 'This will generate upload URL',
    uploadUrl: 'test-url',
    imageKey: 'test-key'
  });
});

app.post('/process', (req, res) => {
  res.json({ 
    message: 'This will process receipt',
    receipt: {
      id: 'test-receipt',
      status: 'processed'
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:3000`);
});
