// Import Google's official Gemini AI SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import AILog model to save logs to PostgreSQL
const { AILog } = require('../models');

// Initialize Gemini with our API key from .env
// This creates our connection to Google's AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── GENERATE PRODUCT DESCRIPTION ────────────────────
const generateDescription = async (productName, category, userEmail = null) => {

  // STEP 1: Get the Gemini model
  // 'gemini-1.5-flash' is fast and free tier friendly
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // STEP 2: Build the prompt
  // A prompt is the instruction we give to the AI
  // The better the prompt, the better the output
  const prompt = `
    You are a professional product copywriter for a B2B procurement system.
    
    Write exactly 2 sentences of professional marketing description for:
    Product Name: ${productName}
    Category: ${category || 'General'}
    
    Rules:
    - Exactly 2 sentences only
    - Professional and business-appropriate tone
    - Focus on business value and use case
    - Do not use phrases like "Introducing" or "Meet"
    - Do not include price or availability
    
    Return only the 2 sentences, nothing else.
  `;

  // STEP 3: Send prompt to Gemini and get response
  const result = await model.generateContent(prompt);

  // STEP 4: Extract the text from response
  // Gemini returns a complex object, we need just the text
  const description = result.response.text().trim();

  // STEP 5: Save log to PostgreSQL ai_logs table
  // This fulfills the assignment's logging requirement
  try {
    await AILog.create({
      productName,
      category: category || 'General',
      generatedDescription: description,
      userEmail: userEmail || 'anonymous'
    });
  } catch (logError) {
    // If logging fails, don't crash the whole request
    // Logging is non-critical
    console.error('Failed to save AI log:', logError.message);
  }

  // STEP 6: Return the description
  return description;
};

// ─── GET ALL AI LOGS ──────────────────────────────────
// Returns all AI generation logs from PostgreSQL
const getAILogs = async () => {
  const logs = await AILog.findAll({
    order: [['created_at', 'DESC']], // newest first
    limit: 50 // last 50 logs only
  });
  return logs;
};

module.exports = {
  generateDescription,
  getAILogs
};