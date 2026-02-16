const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string from Lambda environment variables
const DATABASE_URL = 'postgresql://postgres.yoqpzwqlmdhaapnaufrm:EgWz6MY4FqTqUr73@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require';

async function runMigration() {
    const client = new Client({
        connectionString: DATABASE_URL
    });

    try {
        console.log('Connecting to database...');
        await client.connect();

        const migrationPath = path.join(__dirname, '../../supabase/migrations/20260215230000_create_schedule_c_tables.sql');
        console.log(`Reading migration file: ${migrationPath}`);

        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing migration...');
        await client.query(sql);

        console.log('✅ Migration applied successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
