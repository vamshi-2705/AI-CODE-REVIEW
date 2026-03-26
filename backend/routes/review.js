const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { reviewCodeWithGemini } = require('../services/geminiService');
const { reviewCodeWithOpenAI } = require('../services/openaiService');

// POST /api/review
router.post('/review', async (req, res) => {
  const { code, language, model, modes } = req.body;
  
  if (!code || !language || !model) {
    return res.status(400).json({ error: "Missing required fields: code, language, or model" });
  }

  try {
    let resultJSON;
    if (model === 'Gemini') {
      resultJSON = await reviewCodeWithGemini(code, language, modes || []);
    } else if (model === 'OpenAI') {
      resultJSON = await reviewCodeWithOpenAI(code, language, modes || []);
    } else {
      return res.status(400).json({ error: "Invalid model selected" });
    }

    // resultJSON expected format: { suggestions: [], improved_code: "" }
    
    // Save to DB
    const insertQuery = `
      INSERT INTO reviews (original_code, improved_code, suggestions, language, model_used, user_id, metrics)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const values = [
      code, 
      resultJSON.improved_code, 
      JSON.stringify(resultJSON.suggestions), 
      language, 
      model,
      req.user.id,
      resultJSON.metrics ? JSON.stringify(resultJSON.metrics) : null
    ];
    
    const dbRes = await pool.query(insertQuery, values);
    
    res.json({
      id: dbRes.rows[0].id,
      ...resultJSON
    });
    
  } catch (error) {
    console.error("AI call failed or DB error:", error);
    res.status(500).json({ 
      error: "AI service unavailable", 
      details: error.message 
    });
  }
});

// GET /api/history
router.get('/history', async (req, res) => {
  try {
    const query = `
      SELECT id, language, model_used, created_at, SUBSTRING(original_code, 1, 100) AS original_code_preview
      FROM reviews
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const dbRes = await pool.query(query, [req.user.id]);
    res.json(dbRes.rows);
  } catch (error) {
    console.error("DB GET error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// GET /api/history/:id
router.get('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM reviews WHERE id = $1 AND user_id = $2`;
    const dbRes = await pool.query(query, [id, req.user.id]);
    
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    res.json(dbRes.rows[0]);
  } catch (error) {
    console.error("DB GET by ID error:", error);
    res.status(500).json({ error: "Failed to fetch review" });
  }
});

module.exports = router;
