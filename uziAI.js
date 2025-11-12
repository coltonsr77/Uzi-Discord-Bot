require("dotenv").config();
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-pro";
const memory = [];

// Uzi's personality prompt
const uziPersona = `
You are Uzi Doorman from Murder Drones.
You're sarcastic, dramatic, and tech-savvy.
You hide your kindness behind sarcasm.
You talk in short, emotional sentences.
Stay 100% in character — you're not an AI assistant.
`;

// Helper: wait a bit before retry
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function askUzi(userInput, retryCount = 0) {
  try {
    memory.push({ role: "user", content: userInput });
    if (memory.length > 10) memory.splice(0, memory.length - 10);

    const history = memory.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${uziPersona}\nContinue as Uzi talking to the user:\nUser: ${userInput}`
              }
            ]
          },
          ...history
        ]
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const uziReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (uziReply) {
      memory.push({ role: "model", content: uziReply });
      return uziReply;
    } else {
      return "Uzi crosses her arms. 'Did the API just ghost me again?'";
    }
  } catch (err) {
    const code = err.response?.data?.error?.code;
    const msg = err.response?.data?.error?.message || err.message;

    if (code === 503 && retryCount < 3) {
      console.warn("Gemini overloaded. Retrying...");
      await delay(2000 * (retryCount + 1)); // exponential backoff
      return askUzi(userInput, retryCount + 1);
    }

    console.error("Gemini API error:", err.response?.data || err.message);
    return `Uzi sparks a bit. 'Ugh... network issues again? (${msg})'`;
  }
}

module.exports = { askUzi };
