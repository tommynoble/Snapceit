import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.NODE_ENV === 'production',
  });

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, 'migrations', 'init.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      // Run the SQL commands
      await client.query(sqlContent);
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      // Release the client
      client.release();
    }
  } catch (error) {
    console.error('Failed to run migration:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration();
