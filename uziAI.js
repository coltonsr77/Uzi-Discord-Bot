const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

async function askUzi(prompt) {
  const requestBody = {
    prompt: {
      text: `Respond as a sarcastic, edgy, rebellious AI in the style of Uzi Doorman from Murder Drones.
User says: "${prompt}"`
    },
    maxOutputTokens: 250
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GEMINI_API_KEY}` // or x-goog-api-key if using API key only
        }
      }
    );

    // Gemini's reply
    return response.data.candidates?.[0]?.content || "I have nothing to say.";
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return "Something broke. Not my fault.";
  }
}

module.exports = { askUzi };
