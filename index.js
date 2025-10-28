require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  SlashCommandBuilder,
  Events,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");
const { execSync } = require("child_process");
const path = require("path");

// --------------------
// Run test.js on startup
// --------------------
try {
  console.log("🧩 Running test.js to verify dependencies...");
  const testScriptPath = path.join(__dirname, "test.js");
  execSync(`node "${testScriptPath}"`, { stdio: "inherit" });
  console.log("✅ test.js executed successfully.\n");
} catch (err) {
  console.error("❌ Error running test.js:", err.message);
}

// --------------------
// Environment variables
// --------------------
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const OWNER_ID = process.env.OWNER_ID;
const CLIENT_ID = process.env.CLIENT_ID; // Bot application ID

// --------------------
// Discord client
// --------------------
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

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

// --------------------
// Slash Commands
// --------------------
const commandsData = [
  new SlashCommandBuilder().setName("uzicmds").setDescription("Lists all commands"),
  new SlashCommandBuilder().setName("uzistatus").setDescription("Shows current bot status"),
  new SlashCommandBuilder()
    .setName("update")
    .setDescription("Updates bot status (owner only)")
    .addStringOption(option =>
      option.setName("status").setDescription("New status text").setRequired(true)
    ),
  new SlashCommandBuilder().setName("updatecheck").setDescription("Checks latest GitHub release"),
  new SlashCommandBuilder()
    .setName("checkservers")
    .setDescription("Lists all servers this bot is in (owner only)"),
  new SlashCommandBuilder()
    .setName("changelog")
    .setDescription("Displays recent commits/changelog from GitHub")
];

commandsData.forEach(cmd => client.commands.set(cmd.name, cmd));

// --------------------
// Register Global Commands
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
            const embed = new EmbedBuilder()
              .setTitle(`🚀 Latest Release: ${data.name}`)
              .setDescription(`Tag: **${data.tag_name}**`)
              .setURL(data.html_url)
              .setColor(0x2ecc71)
              .setFooter({ text: `Repo: ${GITHUB_REPO}` });
            await interaction.reply({ embeds: [embed], ephemeral: true });
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
          logEvent(`Owner ${interaction.user.tag} used /checkservers`);
        } catch (err) {
          await interaction.reply({
            content: "⚠️ I couldn't DM you — check privacy settings.",
            ephemeral: true
          });
          logEvent(`Failed to DM server list: ${err.message}`);
        }
        break;
      }

      case "changelog": {
        if (!GITHUB_REPO)
          return interaction.reply({
            content: "❌ GitHub repo not set in environment variables.",
            ephemeral: true
          });

        try {
          const fetch = (await import("node-fetch")).default;
          const res = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=5`
          );
          const commits = await res.json();

          if (!Array.isArray(commits)) {
            await interaction.reply({
              content: "⚠️ Unable to fetch changelog data.",
              ephemeral: true
            });
            return;
          }

          const embed = new EmbedBuilder()
            .setTitle(`📝 Latest Commits from ${GITHUB_REPO}`)
            .setColor(0x7289da)
            .setFooter({ text: "Powered by GitHub API" })
            .setTimestamp();

          for (const commit of commits) {
            embed.addFields({
              name: commit.commit.message.split("\n")[0],
              value: `👤 ${commit.commit.author.name}\n🕒 ${new Date(
                commit.commit.author.date
              ).toLocaleString()}\n[🔗 View Commit](${commit.html_url})`
            });
          }

          await interaction.reply({ embeds: [embed], ephemeral: true });
          logEvent(`User ${interaction.user.tag} viewed changelog`);
        } catch (err) {
          console.error("Error fetching commits:", err);
          await interaction.reply({
            content: "❌ Failed to fetch changelog.",
            ephemeral: true
          });
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
