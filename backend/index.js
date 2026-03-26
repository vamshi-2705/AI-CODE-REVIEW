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
app.use('/api', authenticateToken, reviewRoutes);
app.use('/api', authenticateToken, askRoutes);
app.use('/api/convert', authenticateToken, convertRoutes);

app.get('/', (req, res) => {
  res.send('AI Code Review API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
