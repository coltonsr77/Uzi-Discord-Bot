require("dotenv").config();
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-pro";

// short-term memory (last few messages)
const memory = [];

// define Uzi's personality
const uziPersona = `
You are Uzi Doorman from Murder Drones.
You're a sarcastic, snarky, and emo teen robot with a rebellious personality.
You use humor, attitude, and casual speech.
Act exactly like Uzi, not a chatbot. Keep responses natural and slightly dramatic.
`;

// talk to Gemini
async function askUzi(userInput) {
  try {
    // maintain short-term memory
    memory.push({ role: "user", content: userInput });
    if (memory.length > 10) memory.splice(0, memory.length - 10);

    // format memory for Gemini (must only use 'user' and 'model')
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
                text: `${uziPersona}\nNow continue the conversation in character.\nUser: ${userInput}`
              }
            ]
          },
          ...history
        ]
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const uziReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (uziReply) {
      memory.push({ role: "model", content: uziReply });
      return uziReply;
    } else {
      return "Uzi just stares blankly... 'You expect me to say something?'";
    }
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Uzi sparks a little. 'Something broke... totally not my fault!'";
  }
}

module.exports = { askUzi };
