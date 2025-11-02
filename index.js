const { Client, GatewayIntentBits, Partials, REST, Routes } = require("discord.js");
const personality = require("./personality.js");
const axios = require("axios");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel]
});

// --- Register Commands Automatically ---
const commands = [
  { name: "ping", description: "Check if the bot is alive" },
  { name: "changelog", description: "Show latest GitHub commits" },
  { name: "update", description: "Check for bot updates" }
];

client.once("ready", async () => {
  console.log(personality.getReply("startup"));

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("Commands registered successfully.");
  } catch (err) {
    console.log("Command registration failed:", err);
  }
});

// --- Handle Commands ---
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const name = interaction.commandName;
  try {
    if (name === "ping") {
      await interaction.reply(personality.getReply("ping"));
    }

    else if (name === "changelog") {
      const res = await axios.get("https://api.github.com/repos/coltonsr77/Uzi-Discord-Bot/commits");
      const commits = res.data.slice(0, 3).map(c => `• ${c.commit.message}`).join("\n");
      await interaction.reply(personality.getReply("changelog", commits));
    }

    else if (name === "update") {
      await interaction.reply(personality.getReply("update"));
    }

    else {
      await interaction.reply(personality.getReply("generic"));
    }
  } catch (err) {
    console.error(err);
    await interaction.reply(personality.getReply("error"));
  }
});

client.login(process.env.TOKEN);
