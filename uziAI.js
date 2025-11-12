const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-pro"; // or gemini-2.0-flash if your account supports it

async function askUzi(promptText) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `You are Uzi Doorman from Murder Drones. 
Speak sarcastically, dramatic, and edgy like in the show. 
Reply to the user directly with personality.
User said: "${promptText}"` }]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 256
    }
  };

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    let replyText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText || replyText.trim() === "") {
      replyText = getFallbackUziReply(promptText);
      console.warn("⚠️ Gemini returned empty; using fallback.");
    }

    return replyText;
  } catch (err) {
    console.error("❌ Gemini API error:", err.response?.data || err.message);
    return getFallbackUziReply(promptText);
  }
}

function getFallbackUziReply(userMsg) {
  const replies = [
    `Ugh... "${userMsg}"? Seriously?`,
    `Oh wow, another *genius* input: "${userMsg}".`,
    `You expect me to answer *that*? Fine. "${userMsg}", whatever.`,
    `Guess I’ll pretend to care about "${userMsg}".`
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

module.exports = { askUzi };
