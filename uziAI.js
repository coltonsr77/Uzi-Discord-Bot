const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

async function askUzi(prompt) {
  const body = {
    contents: {
      role: "user",
      parts: {
        text: `Respond as a sarcastic, edgy AI in the style of Uzi Doorman from Murder Drones. User says: "${prompt}"`
      }
    },
    model: MODEL
  };

  try {
    const resp = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        }
      }
    );
    const text = resp.data?.candidates?.[0]?.content?.parts?.text;
    return text || "I have nothing to say.";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Something broke. Not my fault.";
  }
}

module.exports = { askUzi };
