require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const migrate = async () => {
  try {
    await pool.query(`ALTER TABLE qna ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;`);
    await pool.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;`);
    await pool.query(`ALTER TABLE conversions ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;`);

    console.log('Successfully added user_id columns to tracking tables.');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await pool.end();
  }
};

migrate();
