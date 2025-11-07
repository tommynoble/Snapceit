import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ 
  path: path.resolve(__dirname, '../../../.env.local')
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTables() {
  const client = await pool.connect();
  try {
    console.log('Connected to database');
    
    // Check tables and their columns
    const tables = ['users', 'receipts', 'user_settings'];
    for (const table of tables) {
      const result = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1;
      `, [table]);
      
      console.log(`\nTable: ${table}`);
      console.log('Columns:');
      result.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type}`);
      });
    }
  } catch (err) {
    console.error('Error checking tables:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables()
  .then(() => console.log('\nCheck complete'))
  .catch(console.error);
