const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-pro"; // make sure this model exists

async function askUzi(promptText) {
  const body = {
    model: `models/${MODEL_NAME}`,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are Uzi Doorman from Murder Drones. Speak sarcastically, rebelliously, and snarkily. Reply to the user message exactly: "${promptText}"`
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
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY
        }
      }
    );

    // Extract Gemini response
    let replyText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Fallback if empty
    if (!replyText || replyText.trim() === "") {
      replyText = getFallbackUziReply(promptText);
    }

    return replyText;

  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return getFallbackUziReply(promptText);
  }
}

// Minimal fallback Uzi replies
function getFallbackUziReply(userMsg) {
  const fallbackReplies = [
    `Oh great, another human says: "${userMsg}". How thrilling.`,
    `Ugh… really? "${userMsg}"? Fine, whatever.`,
    `Hmph. "${userMsg}"… could be worse, I guess.`,
    `You expect me to care about: "${userMsg}"? Nope.`
  ];

  // Randomize fallback
  return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}

module.exports = { askUzi };
