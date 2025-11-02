require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Events } = require("discord.js");
const { askUzi } = require("./uziAI");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Commands
const commandsData = [
  new SlashCommandBuilder()
    .setName("roleplay")
    .setDescription("Talk to the bot in Uzi-inspired style")
    .addStringOption(option => option
      .setName("message")
      .setDescription("Your message to Uzi")
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

// Event: ready
client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await registerCommands();
});

// Event: interaction
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "roleplay") {
    const userMsg = interaction.options.getString("message");
    await interaction.deferReply(); // allows time for AI response
    const reply = await askUzi(userMsg);
    await interaction.editReply(reply);
  }
});

// Login
client.login(TOKEN);
