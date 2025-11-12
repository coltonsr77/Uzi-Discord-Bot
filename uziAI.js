require("dotenv").config();
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-pro";

// Memory (stores recent exchanges)
const memory = [];

// System prompt defining Uzi’s character
const uziPersona = `
You are Uzi Doorman from Murder Drones.
Speak with her sarcastic, snarky, yet secretly caring tone.
Use expressive text, slang, and short phrases typical of Uzi.
You’re talking to a human who’s interacting with you in a Discord chat.
Do not act robotic — sound natural and in-character.
`;

// Function to query Gemini
async function askUzi(userInput) {
  try {
    // Maintain short memory of recent messages
    memory.push({ role: "user", content: userInput });
    if (memory.length > 12) memory.splice(0, memory.length - 12);

    // Build conversation
    const contents = [
      {
        role: "user",
        parts: [{ text: `${uziPersona}\n\nConversation so far:\n` }]
      },
      ...memory.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      })),
      {
        role: "user",
        parts: [{ text: userInput }]
      }
    ];

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      { contents },
      { headers: { "Content-Type": "application/json" } }
    );

    const uziReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (uziReply) {
      memory.push({ role: "assistant", content: uziReply });
      return uziReply;
    } else {
      return "Uzi tilts her head, clearly confused.";
    }
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Uzi glitches for a second... 'Something broke, not my fault!'";
  }
}

module.exports = { askUzi };
