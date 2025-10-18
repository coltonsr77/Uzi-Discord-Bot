// --------------------
// Load environment variables
// --------------------
require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  SlashCommandBuilder,
  Events,
  REST,
  Routes
} = require("discord.js");

// --------------------
// Environment Variables
// --------------------
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // Your bot's Application ID
const OWNER_ID = process.env.OWNER_ID;
const GITHUB_REPO = process.env.GITHUB_REPO || "";

// Validate essentials
if (!DISCORD_TOKEN) throw new Error("DISCORD_TOKEN is missing in .env");
if (!CLIENT_ID) throw new Error("CLIENT_ID is missing in .env");
if (!OWNER_ID) throw new Error("OWNER_ID is missing in .env");

// --------------------
// Create Discord Client
// --------------------
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Logging helper
function logEvent(message) {
  serverModule.addLog(message);
  console.log(`[LOG] ${message}`);
}

// Update bot status
function updateBotStatus() {
  if (!client.user) return;
  const status = serverModule.botSettings.statusMessage || "Online";
  client.user.setActivity(status, { type: "WATCHING" });
  logEvent(`Bot status set to: ${status}`);
}

// --------------------
// Slash Command Setup
// --------------------
client.commands = new Collection();

const commandsData = [
  new SlashCommandBuilder()
    .setName("cmds")
    .setDescription("Lists all commands available for the bot."),
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows the current bot status."),
  new SlashCommandBuilder()
    .setName("update")
    .setDescription("Updates the bot status (owner only).")
    .addStringOption(option =>
      option
        .setName("status")
        .setDescription("New status message for the bot.")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("updatecheck")
    .setDescription("Checks the latest GitHub release for this bot."),
  new SlashCommandBuilder()
    .setName("checkservers")
    .setDescription("Lists all servers this bot is in (owner only).")
];

commandsData.forEach(cmd => client.commands.set(cmd.name, cmd));

// --------------------
// Register Global Commands
// --------------------
async function registerGlobalCommands() {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  try {
    console.log(`Registering ${commandsData.length} global commands...`);
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commandsData.map(cmd => cmd.toJSON())
    });
    console.log("✅ Global commands registered successfully!");
  } catch (err) {
    console.error("Error registering global commands:", err);
  }
}

// --------------------
// Interaction Handler
// --------------------
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    switch (interaction.commandName) {
      // 🔹 List all commands (visible to everyone)
      case "cmds": {
        const list = Array.from(client.commands.keys())
          .map(c => `/${c}`)
          .join("\n");
        await interaction.reply({
          content: `📜 **Available Commands:**\n${list}`,
          ephemeral: false // everyone can see
        });
        logEvent(`User ${interaction.user.tag} requested command list`);
        break;
      }

      // 🔹 Show current status (visible to everyone)
      case "status": {
        const currentStatus = serverModule.botSettings.statusMessage || "Online";
        await interaction.reply({
          content: `🟢 **Current status:** ${currentStatus}`,
          ephemeral: false // everyone can see
        });
        logEvent(`User ${interaction.user.tag} checked bot status`);
        break;
      }

      // 🔹 Update bot status (Owner only, private)
      case "update": {
        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({
            content: "❌ You do not have permission to use this command.",
            ephemeral: true
          });
        }

        const newStatus = interaction.options.getString("status");
        serverModule.botSettings.statusMessage = newStatus;
        updateBotStatus();
        await interaction.reply({
          content: `✅ Status updated to: ${newStatus}`,
          ephemeral: true
        });
        logEvent(`Owner updated status to: ${newStatus}`);
        break;
      }

      // 🔹 Check GitHub release (Owner only, private)
      case "updatecheck": {
        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({
            content: "❌ You do not have permission to use this command.",
            ephemeral: true
          });
        }

        if (!GITHUB_REPO) {
          return interaction.reply({
            content: "⚠️ GitHub repo not set in environment variables.",
            ephemeral: true
          });
        }

        try {
          const fetch = (await import("node-fetch")).default;
          const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
          const data = await res.json();

          if (data && data.name) {
            await interaction.reply({
              content: `🚀 **Latest Release:** ${data.name} (${data.tag_name})`,
              ephemeral: true
            });
            logEvent(`User ${interaction.user.tag} checked for updates`);
          } else {
            await interaction.reply({
              content: "No release information found on GitHub.",
              ephemeral: true
            });
          }
        } catch (err) {
          await interaction.reply({
            content: "❌ Failed to fetch updates.",
            ephemeral: true
          });
          logEvent(`Error fetching updates: ${err.message}`);
        }
        break;
      }

      // 🔹 List servers (Owner only, private)
      case "checkservers": {
        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({
            content: "❌ You do not have permission to use this command.",
            ephemeral: true
          });
        }

        const guilds = client.guilds.cache.map(g => ({
          name: g.name,
          id: g.id,
          members: g.memberCount ?? "Unknown"
        }));

        if (guilds.length === 0) {
          return interaction.reply({
            content: "I'm not in any servers currently.",
            ephemeral: true
          });
        }

        const listServers = guilds
          .map(g => `• **${g.name}** (${g.id}) — ${g.members} members`)
          .join("\n");

        try {
          await interaction.user.send(
            `🤖 **Servers I'm in (${guilds.length}):**\n${listServers}`
          );
          await interaction.reply({
            content: "📬 I’ve sent you a DM with the server list.",
            ephemeral: true
          });
          logEvent(`Owner ${interaction.user.tag} used /checkservers`);
        } catch (err) {
          await interaction.reply({
            content: "⚠️ I couldn't DM you — check your privacy settings.",
            ephemeral: true
          });
          logEvent(`Failed to DM server list: ${err.message}`);
        }
        break;
      }
    }
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "⚠️ Error executing command.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "⚠️ Error executing command.",
        ephemeral: true
      });
    }
    logEvent(`Command error (${interaction.commandName}): ${err.message}`);
  }
});

// --------------------
// Ready Event
// --------------------
client.once(Events.ClientReady, async () => {
  logEvent(`✅ Bot logged in as ${client.user.tag}`);
  updateBotStatus();
  await registerGlobalCommands();
});
