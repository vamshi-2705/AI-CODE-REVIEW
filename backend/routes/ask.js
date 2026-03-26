const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { askQuestionWithGemini, askQuestionWithGeminiStream } = require('../services/geminiService');
const { askQuestionWithOpenAI, askQuestionWithOpenAIStream } = require('../services/openaiService');

// POST /api/ask
router.post('/ask', async (req, res) => {
  const { question, model } = req.body;
  
  if (!question || !model) {
    return res.status(400).json({ error: "Missing required fields: question or model" });
  }

  try {
    let answer;
    if (model === 'Gemini') {
      answer = await askQuestionWithGemini(question);
    } else if (model === 'OpenAI') {
      answer = await askQuestionWithOpenAI(question);
    } else {
      return res.status(400).json({ error: "Invalid model selected" });
    }

    // Save to DB
    const insertQuery = `
      INSERT INTO qna (question, answer, model_used, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [question, answer, model, req.user.id];
    const dbRes = await pool.query(insertQuery, values);
    
    res.json({
      id: dbRes.rows[0].id,
      answer
    });
    
  } catch (error) {
    console.error("AI call failed or DB error:", error);
    if (error.status === 429) {
      return res.status(429).json({ error: "OpenAI quota exceeded. Please switch to Gemini." });
    }
    res.status(500).json({ error: "AI service unavailable" });
  }
});

// POST /api/ask/stream
router.post('/ask/stream', async (req, res) => {
  const { question, model } = req.body;
  
  if (!question || !model) {
    return res.status(400).json({ error: "Missing required fields: question or model" });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let fullAnswer = "";
    if (model === 'Gemini') {
      const stream = await askQuestionWithGeminiStream(question);
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullAnswer += chunkText;
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    } else if (model === 'OpenAI') {
      const stream = await askQuestionWithOpenAIStream(question);
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullAnswer += text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
    } else {
      res.write(`data: ${JSON.stringify({ error: "Invalid model" })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    res.write('data: [DONE]\n\n');
    res.end();

    // Save to DB in background
    const insertQuery = `
      INSERT INTO qna (question, answer, model_used, user_id)
      VALUES ($1, $2, $3, $4)
    `;
    pool.query(insertQuery, [question, fullAnswer, model, req.user.id]).catch(err => {
      console.error("Failed to save QnA to DB:", err);
    });
    
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "AI service unavailable or quota exceeded" })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// GET /api/ask/history
router.get('/ask/history', async (req, res) => {
  try {
    const query = `
      SELECT id, model_used, created_at, SUBSTRING(question, 1, 100) AS question_preview
      FROM qna
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const dbRes = await pool.query(query, [req.user.id]);
    res.json(dbRes.rows);
  } catch (error) {
    console.error("DB GET error:", error);
    res.status(500).json({ error: "Failed to fetch qna history" });
  }
});

// GET /api/ask/history/:id
router.get('/ask/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM qna WHERE id = $1 AND user_id = $2`;
    const dbRes = await pool.query(query, [id, req.user.id]);
    
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ error: "QnA not found" });
    }
    
    res.json(dbRes.rows[0]);
  } catch (error) {
    console.error("DB GET by ID error:", error);
    res.status(500).json({ error: "Failed to fetch QnA" });
  }
});

module.exports = router;
