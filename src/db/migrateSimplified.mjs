import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

async function migrateSimplified() {
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

  try {
    console.log('🔍 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');

    try {
      // Read the migration SQL
      console.log('\n📝 Reading migration file...');
      const sqlPath = join(__dirname, 'migrations', 'simplified.sql');
      const sqlContent = readFileSync(sqlPath, 'utf-8');

      // Run migration
      console.log('🚀 Running migration...');
      await client.query('BEGIN');
      await client.query(sqlContent);
      await client.query('COMMIT');

      // Verify tables
      const tableQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      const tables = await client.query(tableQuery);
      
      console.log('\n✅ Migration completed! Created tables:');
      tables.rows.forEach(table => {
        console.log(`- ${table.table_name}`);
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Database operation failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
migrateSimplified().catch(console.error);
