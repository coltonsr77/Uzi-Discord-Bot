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
            text: `You are Uzi Doorman from Murder Drones. Speak sarcastically, rebelliously, and in a snarky, edgy tone. Respond to this message: "${userMessage}"`
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

    // Extract Gemini's text
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Return it framed as Uzi Doorman
    return text ? `Uzi Doorman says: ${text}` : "Uzi Doorman is silent…";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Uzi Doorman grumbles: Something broke… not my problem.";
  }
}

module.exports = { askUzi };
