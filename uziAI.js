const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

async function askUzi(userMessage) {
  const requestBody = {
    model: GEMINI_MODEL,
    temperature: 0.7,
    candidateCount: 1,
    prompt: {
      messages: [
        {
          author: "user",
          content: [
            {
              type: "text",
              text: `Respond as a sarcastic, edgy, rebellious AI in the style of Uzi Doorman from Murder Drones.
User says: "${userMessage}"`
            }
          ]
        }
      ]
    }
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateText`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        }
      }
    );

    return response.data.candidates?.[0]?.content?.[0]?.text || "I have nothing to say.";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Something broke. Not my fault.";
  }
}

module.exports = { askUzi };
