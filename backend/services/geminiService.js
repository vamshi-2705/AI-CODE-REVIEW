const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const reviewCodeWithGemini = async (code, language, modes = []) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const modeInstructions = modes.length > 0 
    ? `Focus heavily on the following aspects: ${modes.join(', ')}.` 
    : '';

  const prompt = `System: "You are an elite senior code reviewer and performance optimization expert. Return ONLY valid raw JSON. No markdown. No explanation."\n\nUser: "Review and deeply optimize this ${language} code for performance and Big-O efficiency. ${modeInstructions}
Return this exact JSON shape:
{
  "suggestions": [
    { "line": number, "issue": string, "fix": string }
  ],
  "metrics": {
    "cyclomatic_complexity": number,
    "lines_of_code": number,
    "number_of_functions": number,
    "maintainability_score": number // 1 to 10
  },
  "improved_code": "string"
}

Code: ${code}"`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  
  // Clean up markdown block if present
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", text);
    throw new Error("Failed to parse AI response as JSON");
  }
};

const askQuestionWithGemini = async (question) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const prompt = `System: "You are an expert software engineer and helpful coding assistant."\n\nUser: "${question}"\n\nProvide a clear, detailed explanation. Include code examples formatted in markdown where appropriate.`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

const askQuestionWithGeminiStream = async (question) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const prompt = `System: "You are an expert software engineer and helpful coding assistant."\n\nUser: "${question}"\n\nProvide a clear, detailed explanation. Include code examples formatted in markdown where appropriate.`;
  const result = await model.generateContentStream(prompt);
  return result.stream;
};

module.exports = { reviewCodeWithGemini, askQuestionWithGemini, askQuestionWithGeminiStream };
