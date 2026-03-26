const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reviewRoutes = require('./routes/review');
const askRoutes = require('./routes/ask');
const convertRoutes = require('./routes/convert');
const authRoutes = require('./routes/auth'); // ADD THIS
const authenticateToken = require('./middleware/auth'); // Guard

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Unprotected
app.get('/api/test-config', async (req, res) => {
  const status = {
    geminiKey: !!process.env.GEMINI_API_KEY,
    openaiKey: !!process.env.OPENAI_API_KEY,
    dbUrl: !!process.env.DATABASE_URL,
    frontendUrl: process.env.FRONTEND_URL || 'Not Set',
    dbStatus: 'Testing...'
  };
  
  try {
    const dbPool = require('./db/pool');
    await dbPool.query('SELECT 1');
    status.dbStatus = 'Connected';
  } catch (err) {
    status.dbStatus = `Failed: ${err.message}`;
  }
  
  res.json(status);
});

app.use('/api', authenticateToken, reviewRoutes);
app.use('/api', authenticateToken, askRoutes);
app.use('/api/convert', authenticateToken, convertRoutes);

app.get('/', (req, res) => {
  res.send('AI Code Review API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
