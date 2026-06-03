const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT current_database(), current_user, version()');
    console.log('--- DB connection successful! ---');
    console.log('Database:', res.rows[0].current_database);
    console.log('User:', res.rows[0].current_user);
    
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in database:', tables.rows.map(r => r.table_name));
    
    if (tables.rows.map(r => r.table_name).includes('users')) {
      const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
      console.log('Columns in "users" table:');
      columns.rows.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));
    } else {
      console.log('WARNING: "users" table NOT FOUND!');
    }
  } catch (err) {
    console.error('--- DB connection FAILED! ---');
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
