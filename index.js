require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Events } = require("discord.js");
const { askUzi } = require("./uziAI");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Slash command
const commandsData = [
  new SlashCommandBuilder()
    .setName("roleplay")
    .setDescription("Talk to Uzi Doorman WIP")
    .addStringOption(option =>
      option.setName("message")
        .setDescription("Your message to Uzi Doorman")
        .setRequired(true))
].map(cmd => cmd.toJSON());

// Register commands
async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandsData });
    console.log("Commands registered globally");
  } catch (err) {
    console.error("Command registration failed:", err);
  }
}

// Ready
client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await registerCommands();
});

// Interaction
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "roleplay") {
    const userMessage = interaction.options.getString("message");

    await interaction.deferReply(); // gives time for Gemini
    const uziReply = await askUzi(userMessage);

    // Reply with Gemini text only
    await interaction.editReply(uziReply);
  }
});

// Login
client.login(TOKEN);
