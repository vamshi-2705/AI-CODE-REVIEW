require('dotenv').config();
const { reviewCodeWithGroq, askQuestionWithGroq } = require('./services/groqService');

async function testGroq() {
  console.log("--- Testing Groq Integration ---");
  console.log("GROQ_API_KEY Configured:", !!process.env.GROQ_API_KEY);

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('mock')) {
    console.log("\nWARNING: No valid GROQ_API_KEY found in .env (or it is a dev mock key).");
    console.log("Please set a valid GROQ_API_KEY in backend/.env to run real API tests.");
    console.log("Integration is successfully compiled. We will dry-test service loading:");
    try {
      require('./services/groqService');
      console.log("SUCCESS: groqService loaded and initialized successfully!");
    } catch (e) {
      console.error("FAILED to load groqService:", e);
    }
    return;
  }

  try {
    console.log("\n1. Testing askQuestionWithGroq with a simple prompt...");
    const answer = await askQuestionWithGroq("Hello! Please reply with 'Groq is ready!'");
    console.log("Response from Groq:\n", answer);

    console.log("\n2. Testing reviewCodeWithGroq with a short snippet...");
    const review = await reviewCodeWithGroq('const add = (a, b) => a + b;', 'JavaScript', ['quality']);
    console.log("Review response received successfully!");
    console.log("Metrics:", JSON.stringify(review.metrics, null, 2));
    console.log("Suggestions count:", review.suggestions?.length || 0);
  } catch (err) {
    console.error("Error during Groq API call:", err.message);
  }
}

testGroq();
