const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

async function askUzi(userMessage) {
  const body = {
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `You are Uzi Doorman from Murder Drones. Speak sarcastically, rebelliously, and in a snarky tone like Uzi. Respond to the human: "${userMessage}"`
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

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "I have nothing to say.";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Ugh… something broke. Not my problem.";
  }
}

module.exports = { askUzi };
