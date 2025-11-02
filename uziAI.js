const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash"; // Your model

async function askUzi(userMessage) {
  const body = {
    model: MODEL,
    contents: [
      {
        role: "user",
        text: `You are Uzi Doorman from Murder Drones. Speak sarcastically, rebelliously, and in a snarky, edgy tone. Respond to the following message from a human: "${userMessage}"`
      }
    ]
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

    const text = response.data?.candidates?.[0]?.content?.[0]?.text;
    return text || "Ugh… I have nothing to say.";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Ugh… something broke. Not my problem.";
  }
}

module.exports = { askUzi };
