const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";  // must match one from docs

async function askUzi(promptText) {
  const body = {
    model: `models/${MODEL_NAME}`,
    contents: [
      {
        role: "user",
        parts: [
          { text: `You are Uzi Doorman from Murder Drones. Respond sarcastically to: "${promptText}"` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 250
    }
  };

  try {
    const resp = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY
        }
      }
    );
    const replyText = resp.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return replyText || "Uzi Doorman is silent…";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Uzi Doorman grumbles: Something broke…";
  }
}

module.exports = { askUzi };
