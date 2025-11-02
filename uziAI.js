const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Your Gemini/AI API key

/**
 * Ask Gemini to reply like a sarcastic AI character
 * @param {string} prompt - The user's message
 * @returns {Promise<string>} - Gemini's response
 */
async function askUzi(prompt) {
  const fullPrompt = `Respond as a sarcastic, edgy, rebellious AI in the style of Uzi Doorman from Murder Drones. 
User says: "${prompt}"`;

  try {
    const response = await axios.post(
      "https://api.gemini.ai/v1/chat", // Replace with actual Gemini endpoint
      {
        model: "gemini-1", // or whatever model you have access to
        messages: [{ role: "user", content: fullPrompt }]
      },
      {
        headers: {
          "Authorization": `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Gemini's reply
    return response.data.choices?.[0]?.message?.content || "I have no words.";
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return "I refuse to answer. Something broke.";
  }
}

module.exports = { askUzi };
