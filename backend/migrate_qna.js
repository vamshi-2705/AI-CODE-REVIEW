require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS qna (
  id             SERIAL PRIMARY KEY,
  question       TEXT NOT NULL,
  answer         TEXT NOT NULL,
  model_used     VARCHAR(50),
  created_at     TIMESTAMP DEFAULT NOW()
);
`;

async function migrate() {
  try {
    await pool.query(createTableQuery);
    console.log("Successfully created qna table");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await pool.end();
  }
}

migrate();
