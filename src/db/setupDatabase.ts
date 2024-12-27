import { Client } from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  // First, connect to PostgreSQL to create the database
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    // Connect to default postgres database initially
    database: 'postgres',
    ssl: process.env.NODE_ENV === 'production',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if our database exists
    const dbName = process.env.DB_NAME || 'receipt_scanner';
    const checkDbQuery = `
      SELECT datname FROM pg_database 
      WHERE datname = $1
    `;
    const dbExists = await client.query(checkDbQuery, [dbName]);

    if (dbExists.rowCount === 0) {
      // Create the database if it doesn't exist
      console.log(`Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log('Database created successfully');
    } else {
      console.log(`Database ${dbName} already exists`);
    }

    // Close connection to postgres database
    await client.end();

    // Connect to our newly created database
    const dbClient = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST || 'localhost',
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: dbName,
      ssl: process.env.NODE_ENV === 'production',
    });

    await dbClient.connect();
    console.log(`Connected to ${dbName} database`);

    // Read and execute the initialization SQL
    const sqlPath = join(__dirname, 'migrations', 'init.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    console.log('Creating tables...');
    await dbClient.query(sqlContent);
    console.log('Tables created successfully');

    // Verify tables were created
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tables = await dbClient.query(tablesQuery);
    console.log('\nCreated tables:');
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });

    await dbClient.end();
    console.log('\n✅ Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
