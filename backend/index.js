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

// Unprotected diagnostic route
app.get('/test-backend-config', async (req, res) => {
  const status = {
    geminiKey: !!process.env.GEMINI_API_KEY,
    openaiKey: !!process.env.OPENAI_API_KEY,
    dbUrl: !!process.env.DATABASE_URL,
    frontendUrl: process.env.FRONTEND_URL || 'Not Set',
    dbStatus: 'Testing...',
    aiStatus: 'Testing...'
  };
  
  try {
    const dbPool = require('./db/pool');
    await dbPool.query('SELECT 1');
    status.dbStatus = 'Connected';
  } catch (err) {
    status.dbStatus = `Failed: ${err.message}`;
  }

  try {
    const { reviewCodeWithGemini } = require('./services/geminiService');
    await reviewCodeWithGemini('print("hi")', 'Python', []);
    status.aiStatus = 'Gemini Working';
  } catch (err) {
    status.aiStatus = `Gemini Failed: ${err.message}`;
  }
  
  res.json(status);
});

// Protected routes (middleware only applies to these)
app.use('/api', authenticateToken); 
app.use('/api', reviewRoutes);
app.use('/api', askRoutes);
app.use('/api/convert', convertRoutes);

app.get('/', (req, res) => {
  res.send('AI Code Review API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
