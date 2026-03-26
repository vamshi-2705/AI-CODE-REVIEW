const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const reviewCodeWithOpenAI = async (code, language, modes = []) => {
  const modeInstructions = modes.length > 0 
    ? `Focus heavily on the following aspects: ${modes.join(', ')}.` 
    : '';

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
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

  let text = response.choices[0].message.content;
  
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse OpenAI JSON:", text);
    throw new Error("Failed to parse AI response as JSON");
  }
};

const askQuestionWithOpenAI = async (question) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
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

const askQuestionWithOpenAIStream = async (question) => {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
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

module.exports = { reviewCodeWithOpenAI, askQuestionWithOpenAI, askQuestionWithOpenAIStream };
