import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config({ path: '.env.local' });

async function testInsert() {
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
      await client.query('BEGIN');

      // Insert test user
      const userResult = await client.query(`
        INSERT INTO users (id, email, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, ['test_user_123', 'test@example.com', 'Test', 'User']);

      console.log('✅ Created test user');

      // Insert test receipt
      await client.query(`
        INSERT INTO receipts (
          user_id, 
          image_url, 
          merchant_name, 
          total_amount, 
          transaction_date,
          category,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userResult.rows[0].id,
        'https://example-bucket.s3.amazonaws.com/test-receipt.jpg',
        'Walmart',
        99.99,
        '2023-12-22',
        'Shopping',
        'processed'
      ]);

      console.log('✅ Created test receipt');

      // Insert user settings
      await client.query(`
        INSERT INTO user_settings (user_id)
        VALUES ($1)
      `, [userResult.rows[0].id]);

      console.log('✅ Created user settings');

      await client.query('COMMIT');

      // Verify data
      const userData = await client.query('SELECT * FROM users');
      const receiptData = await client.query('SELECT * FROM receipts');
      const settingsData = await client.query('SELECT * FROM user_settings');

      console.log('\n📊 Database contents:');
      console.log('\nUsers:', userData.rows);
      console.log('\nReceipts:', receiptData.rows);
      console.log('\nSettings:', settingsData.rows);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Test insert failed:', error);
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

// Run the test
testInsert().catch(console.error);
