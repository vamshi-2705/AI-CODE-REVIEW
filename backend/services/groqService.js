const Groq = require('groq-sdk');
require('dotenv').config();

let groqClient;
const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured in the environment variables. Please add GROQ_API_KEY to your .env file.");
    }
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
};

// Use llama-3.3-70b-versatile as it has JSON mode support and high quality
const MODEL_NAME = "llama-3.3-70b-versatile";

const reviewCodeWithGroq = async (code, language, modes = []) => {
  const client = getGroqClient();
  const modeInstructions = modes.length > 0 
    ? `Focus heavily on the following aspects: ${modes.join(', ')}.` 
    : '';

  const response = await client.chat.completions.create({
    model: MODEL_NAME,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are an elite senior code reviewer and performance optimization expert. Return ONLY valid raw JSON. No markdown. No explanation. Your response MUST strictly follow the JSON shape."
      },
      {
        role: "user",
        content: `Review and deeply optimize this ${language} code for performance and Big-O efficiency. ${modeInstructions}\nReturn this exact JSON shape:\n{\n  "suggestions": [\n    { "line": number, "issue": string, "fix": string }\n  ],\n  "metrics": {\n    "cyclomatic_complexity": number,\n    "lines_of_code": number,\n    "number_of_functions": number,\n    "maintainability_score": number\n  },\n  "improved_code": "string with the completely functionally optimized code"\n}\n\nCode:\n${code}`
      }
    ]
  });

  const text = response.choices[0].message.content;
  
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Groq JSON:", text);
    throw new Error("Failed to parse AI response as JSON");
  }
};

const askQuestionWithGroq = async (question) => {
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      {
        role: "system",
        content: "You are an expert software engineer and helpful coding assistant. Provide a clear, detailed explanation. Include code examples formatted in markdown where appropriate."
      },
      {
        role: "user",
        content: question
      }
    ]
  });
  return response.choices[0].message.content;
};

const askQuestionWithGroqStream = async (question) => {
  const client = getGroqClient();
  const stream = await client.chat.completions.create({
    model: MODEL_NAME,
    stream: true,
    messages: [
      {
        role: "system",
        content: "You are an expert software engineer and helpful coding assistant. Provide a clear, detailed explanation. Include code examples formatted in markdown where appropriate."
      },
      {
        role: "user",
        content: question
      }
    ]
  });
  return stream;
};

module.exports = { reviewCodeWithGroq, askQuestionWithGroq, askQuestionWithGroqStream };
