const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash"; // confirm this is available for your project

async function askUzi(promptText) {
  const body = {
    model: `models/${MODEL_NAME}`,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are Uzi Doorman from Murder Drones. Speak sarcastically, rebelliously, and in a snarky tone. Respond to the user message exactly: "${promptText}"`
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

    // Return Gemini's text exactly
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Error: Gemini failed to respond.";
  }
}

module.exports = { askUzi };
