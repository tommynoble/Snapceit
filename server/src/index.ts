import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool, testConnection } from './db/config';
import receiptsRouter from './routes/receipts';
import usersRouter from './routes/users';
import analyticsRouter from './routes/analytics';
import categoriesRouter from './routes/categories';

const app = express();

// Security middleware
app.use(helmet()); 
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://snapceit.com', 'https://app.snapceit.com'] 
    : ['http://localhost:5173'], 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Test database connection
testConnection();

// Routes
app.use('/api/receipts', receiptsRouter);
app.use('/api/users', usersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/categories', categoriesRouter);

// Health check endpoint that also checks DB connection
app.get('/', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
