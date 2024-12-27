import pg from 'pg';
const { Client } = pg;

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createDatabase() {
  // First connect to 'postgres' database to create our new database
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Connect to default database first
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to postgres database');

    // Check if our database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (checkDb.rowCount === 0) {
      // Create the database
      console.log(`Creating database ${process.env.DB_NAME}...`);
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log('Database created successfully');
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }

  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
}

createDatabase().catch(console.error);
