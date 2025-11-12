const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-pro"; // try 2.0-flash if your key supports it

async function askUzi(promptText) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are Uzi Doorman from Murder Drones. 
Use her sarcastic, dark, rebellious personality. 
Never be formal, never robotic. 
Respond directly to the user’s message:
"${promptText}"`
          }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    // Gemini sometimes returns text under different paths — check all.
    let replyText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.data?.candidates?.[0]?.output_text ||
      response.data?.candidates?.[0]?.text ||
      null;

    if (!replyText || replyText.trim() === "") {
      console.warn("⚠️ Gemini returned empty, using fallback");
      replyText = getFallbackUziReply(promptText);
    }

    return replyText;
  } catch (err) {
    console.error(
      "❌ Gemini API error:",
      err.response?.data || err.message
    );
    return getFallbackUziReply(promptText);
  }
}

function getFallbackUziReply(userMsg) {
  const replies = [
    `Ugh, "${userMsg}"? Really?`,
    `You expect me to answer *that*? Wow.`,
    `Oh sure, like I have time for "${userMsg}".`,
    `Guess I’ll pretend to care about "${userMsg}". Whatever.`
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

module.exports = { askUzi };
