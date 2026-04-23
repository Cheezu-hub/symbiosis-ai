const fs = require('fs');
const path = require('path');
const { pool } = require('./models/database');

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running database migrations...');
    await pool.query(schemaSql);
    console.log('Database migrations applied successfully.');
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
