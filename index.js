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

// Environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const OWNER_ID = process.env.OWNER_ID;
const CLIENT_ID = process.env.CLIENT_ID; // Bot application ID

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Simple logger
function logEvent(message) {
  console.log(`[LOG] ${message}`);
}

// Update bot status
function updateBotStatus() {
  if (!client.user) return;
  const status = "Online";
  client.user.setActivity(status, { type: "WATCHING" });
  logEvent(`Bot status set to: ${status}`);
}

// Collection for slash commands
client.commands = new Collection();

// --------------------
// Define Slash Commands
// --------------------
const commandsData = [
  new SlashCommandBuilder().setName("commands").setDescription("Lists all commands"),
  new SlashCommandBuilder().setName("status").setDescription("Shows current bot status"),
  new SlashCommandBuilder()
    .setName("update")
    .setDescription("Updates bot status (owner only)")
    .addStringOption(option =>
      option.setName("status").setDescription("New status text").setRequired(true)
    ),
  new SlashCommandBuilder().setName("updatecheck").setDescription("Checks latest GitHub release"),
  new SlashCommandBuilder()
    .setName("checkservers")
    .setDescription("Lists all servers this bot is in (owner only)")
];

// Add to collection
commandsData.forEach(cmd => client.commands.set(cmd.name, cmd));

// --------------------
// Global command registration
// --------------------
async function registerGlobalCommands() {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
  try {
    console.log("Registering global slash commands...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commandsData.map(cmd => cmd.toJSON())
    });
    console.log("✅ Global slash commands registered!");
  } catch (err) {
    console.error("Error registering global commands:", err);
  }
}

// --------------------
// Interaction handling
// --------------------
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    switch (interaction.commandName) {
      case "commands": {
        const list = Array.from(client.commands.keys())
          .map(c => `/${c}`)
          .join("\n");
        await interaction.reply({
          content: `Available commands:\n${list}`,
          ephemeral: true
        });
        logEvent(`User ${interaction.user.tag} requested command list`);
        break;
      }

      case "status": {
        await interaction.reply({
          content: `Current status: Online`,
          ephemeral: true
        });
        logEvent(`User ${interaction.user.tag} checked bot status`);
        break;
      }

      case "update": {
        if (interaction.user.id !== OWNER_ID)
          return interaction.reply({
            content: "❌ You cannot use this command.",
            ephemeral: true
          });

        const newStatus = interaction.options.getString("status");
        client.user.setActivity(newStatus, { type: "WATCHING" });
        await interaction.reply({
          content: `✅ Status updated to: ${newStatus}`,
          ephemeral: true
        });
        logEvent(`Owner updated status to: ${newStatus}`);
        break;
      }

      case "updatecheck": {
        if (!GITHUB_REPO)
          return interaction.reply({
            content: "GitHub repo not set.",
            ephemeral: true
          });

        try {
          const fetch = (await import("node-fetch")).default;
          const res = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
          );
          const data = await res.json();
          if (data && data.name) {
            await interaction.reply({
              content: `Latest release: **${data.name}** (${data.tag_name})`,
              ephemeral: true
            });
            logEvent(`User ${interaction.user.tag} checked for updates`);
          } else {
            await interaction.reply({
              content: "No release information found.",
              ephemeral: true
            });
          }
        } catch (err) {
          await interaction.reply({
            content: "Failed to fetch updates.",
            ephemeral: true
          });
          logEvent(`Error fetching updates: ${err.message}`);
        }
        break;
      }

      case "checkservers": {
        if (interaction.user.id !== OWNER_ID)
          return interaction.reply({
            content: "❌ You cannot use this command.",
            ephemeral: true
          });

        const guilds = client.guilds.cache.map(g => ({
          name: g.name,
          id: g.id,
          members: g.memberCount ?? "Unknown"
        }));

        if (guilds.length === 0) {
          return interaction.reply({
            content: "I'm not in any servers right now.",
            ephemeral: true
          });
        }

        const listServers = guilds
          .map(g => `• **${g.name}** (${g.id}) — ${g.members} members`)
          .join("\n");

        try {
          await interaction.user.send(
            `**Servers I'm in (${guilds.length}):**\n${listServers}`
          );
          await interaction.reply({
            content: "📬 I’ve sent you a DM with the server list.",
            ephemeral: true
          });
          logEvent(
            `Owner ${interaction.user.tag} used /checkservers (sent via DM).`
          );
        } catch (err) {
          await interaction.reply({
            content:
              "⚠️ I couldn't DM you — please check your privacy settings.",
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
        content: "Error executing command.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "Error executing command.",
        ephemeral: true
      });
    }
    logEvent(`Command error (${interaction.commandName}): ${err.message}`);
  }
});

// --------------------
// Ready event
// --------------------
client.once(Events.ClientReady, async () => {
  logEvent(`Bot logged in as ${client.user.tag}`);
  updateBotStatus();
  await registerGlobalCommands();
});

// --------------------
// Bot login
// --------------------
client.login(DISCORD_TOKEN);
