const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5";

async function askUzi(userMessage) {
  const body = {
    model: MODEL,
    prompt: {
      text: `You are Uzi Doorman from Murder Drones. Speak sarcastically, rebelliously, and in a snarky tone. Respond to: "${userMessage}"`
    },
    temperature: 0.7,
    maxOutputTokens: 250
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateText`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        }
      }
    );

    // Extract the generated text
    const text = response.data?.candidates?.[0]?.output?.[0]?.content?.[0]?.text;
    return text ? `Uzi Doorman says: ${text}` : "Uzi Doorman is silent…";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Uzi Doorman grumbles: Something broke… not my problem.";
  }
}

module.exports = { askUzi };
