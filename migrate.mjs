import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  try {
    // Parse DATABASE_URL (format: mysql://user:password@host:port/database)
    const url = new URL(dbUrl);
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: url.hostname.includes('tidb') || url.hostname.includes('rds') ? { rejectUnauthorized: false } : undefined,
    });

    console.log('Connected to database');

    // Read and execute migration
    const migrationPath = path.join(__dirname, 'drizzle', '0004_illegal_captain_marvel.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by statement-breakpoint and execute each statement
    const statements = migrationSQL
      .split('-->')
      .map(s => s.replace(/statement-breakpoint/g, '').trim())
      .filter(s => s.length > 0 && s.startsWith('ALTER'));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 80)}...`);
      try {
        await connection.execute(statement);
        console.log('✓ Statement executed successfully');
      } catch (error) {
        // Ignore "column already exists" errors
        if (error.message.includes('already exists')) {
          console.log('⚠ Column already exists (skipping)');
        } else {
          throw error;
        }
      }
    }

    await connection.end();
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
