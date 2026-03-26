const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { askQuestionWithGeminiStream } = require('../services/geminiService');
const { askQuestionWithOpenAIStream } = require('../services/openaiService');

router.post('/stream', async (req, res) => {
  const { code, targetLanguage, model } = req.body;
  
  if (!code || !targetLanguage || !model) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const prompt = `You are a highly capable code converter. 
Please convert the following code into ${targetLanguage}.
Respond ONLY with the complete, translated code.
Do not include any explanations, greetings, or filler text. Format it neatly.

Original Code to convert:
\`\`\`
${code}
\`\`\``;

  try {
    let fullAnswer = "";
    if (model === 'Gemini') {
      const stream = await askQuestionWithGeminiStream(prompt);
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullAnswer += chunkText;
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    } else if (model === 'OpenAI') {
      const stream = await askQuestionWithOpenAIStream(prompt);
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

    try {
      // Clean markdown code blocks from the finalized full answer before saving
      let cleanCode = fullAnswer;
      if (cleanCode.startsWith('\`\`\`')) {
        const lines = cleanCode.split('\n');
        lines.shift(); // Remove starting ```language
        if (lines[lines.length - 1].startsWith('\`\`\`')) {
          lines.pop(); // Remove closing ```
        }
        cleanCode = lines.join('\n');
      }

      const insertQuery = `
        INSERT INTO conversions (original_code, converted_code, target_language, model_used, user_id)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(insertQuery, [code, cleanCode, targetLanguage, model, req.user.id]);
    } catch(dbErr) {
      console.error("DB insertion failed for conversion:", dbErr);
    }
    
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "AI service unavailable" })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// GET /api/convert/history
router.get('/history', async (req, res) => {
  try {
    const query = `
      SELECT id, target_language, model_used, created_at, SUBSTRING(original_code, 1, 100) AS original_code_preview
      FROM conversions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const dbRes = await pool.query(query, [req.user.id]);
    res.json(dbRes.rows);
  } catch (error) {
    console.error("DB GET error:", error);
    res.status(500).json({ error: "Failed to fetch conversion history" });
  }
});

// GET /api/convert/history/:id
router.get('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM conversions WHERE id = $1 AND user_id = $2`;
    const dbRes = await pool.query(query, [id, req.user.id]);
    
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ error: "Conversion not found" });
    }
    
    res.json(dbRes.rows[0]);
  } catch (error) {
    console.error("DB GET by ID error:", error);
    res.status(500).json({ error: "Failed to fetch conversion" });
  }
});

module.exports = router;
