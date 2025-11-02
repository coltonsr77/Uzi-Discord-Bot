const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

// In-memory conversation history per user
const conversationHistory = {}; // { userId: [messages] }

const MAX_HISTORY = 5; // Keep last 5 messages per user

async function askUzi(userId, userMessage) {
  // Initialize history if needed
  if (!conversationHistory[userId]) conversationHistory[userId] = [];

  // Add user message to history
  conversationHistory[userId].push({ role: "user", text: userMessage });

  // Keep history within MAX_HISTORY
  if (conversationHistory[userId].length > MAX_HISTORY) {
    conversationHistory[userId] = conversationHistory[userId].slice(-MAX_HISTORY);
  }

  // Build prompt for Gemini
  const historyText = conversationHistory[userId]
    .map(msg => `${msg.role === "user" ? "Human" : "Uzi Doorman"}: ${msg.text}`)
    .join("\n");

  const body = {
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are Uzi Doorman from Murder Drones. Respond sarcastically, rebelliously, and in a snarky tone. 
Continue the conversation naturally with context from previous messages:
${historyText}
Human: "${userMessage}"`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 250
    }
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        }
      }
    );

    // Get Gemini's response text
    const uziReply = response.data?.candidates?.[0]?.content?.[0]?.text || "Uzi Doorman is silent…";

    // Add Uzi's reply to history
    conversationHistory[userId].push({ role: "uzi", text: uziReply });

    return `Uzi Doorman says: ${uziReply}`;
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Uzi Doorman grumbles: Something broke… not my problem.";
  }
}

module.exports = { askUzi };
