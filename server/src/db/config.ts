import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from the root directory
dotenv.config({ 
  path: path.resolve(__dirname, '../../../.env.local')
});

// Construct database URL from individual environment variables
const DB_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

// Configure Prisma Client with logging
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DB_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Test the database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL RDS');
    console.log(`Connected to: ${process.env.DB_HOST}`);
    
    // List all tables in the database
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Available tables:', tables);
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL RDS:', error);
    process.exit(1);
  }
}

export { prisma, testConnection };
