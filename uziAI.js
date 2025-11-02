const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Ask Gemini to reply like a sarcastic AI character
 * @param {string} prompt - User input
 * @returns {Promise<string>} - Gemini's reply
 */
async function askUzi(prompt) {
  const fullPrompt = `Respond as a sarcastic, edgy, rebellious AI in the style of Uzi Doorman from Murder Drones.
User says: "${prompt}"`;

  try {
    const response = await axios.post(
      "https://api.gemini.ai/v1/chat", // replace with your actual endpoint
      {
        model: "gemini-1",
        messages: [{ role: "user", content: fullPrompt }]
      },
      {
        headers: {
          "Authorization": `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices?.[0]?.message?.content || "I have nothing to say.";
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return "Something broke. Not my fault.";
  }
}

module.exports = { askUzi };
