require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const migrate = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS conversions (
        id SERIAL PRIMARY KEY,
        original_code TEXT NOT NULL,
        converted_code TEXT NOT NULL,
        target_language VARCHAR(50) NOT NULL,
        model_used VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(query);
    console.log('Successfully created conversions table if not exists.');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await pool.end();
  }
};

migrate();
