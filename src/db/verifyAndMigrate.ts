import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function verifyAndMigrate() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: {
      rejectUnauthorized: false // Required for RDS SSL connection
    }
  });

  try {
    // Test the connection
    console.log('🔍 Testing connection to RDS...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to RDS!');

    try {
      // Get current tables
      const tableQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      const existingTables = await client.query(tableQuery);
      console.log('\nExisting tables:', existingTables.rows.map(r => r.table_name));

      // Read the migration SQL
      console.log('\n📝 Reading migration file...');
      const sqlPath = join(__dirname, 'migrations', 'init.sql');
      const sqlContent = readFileSync(sqlPath, 'utf-8');

      // Run migration
      console.log('🚀 Running migration...');
      await client.query('BEGIN');
      await client.query(sqlContent);
      await client.query('COMMIT');

      // Verify tables after migration
      const finalTables = await client.query(tableQuery);
      console.log('\n✅ Migration completed! Created tables:');
      finalTables.rows.forEach(table => {
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

// Run the verification and migration
verifyAndMigrate().catch(console.error);
