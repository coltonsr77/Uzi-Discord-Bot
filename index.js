require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const serverModule = require("./server.js");

// Environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const OWNER_ID = process.env.OWNER_ID;

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
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

// Commands
const commands = {
  uzicmds: {
    description: "Lists all commands",
    execute: (msg) => {
      const list = Object.keys(commands)
        .map(cmd => `!${cmd} - ${commands[cmd].description}`)
        .join("\n");
      msg.reply(`Available commands:\n${list}`);
      logEvent(`User ${msg.author.tag} requested command list`);
    }
  },

  uzistatus: {
    description: "Shows current bot status",
    execute: (msg) => {
      msg.reply(`Current status: ${serverModule.botSettings.statusMessage}`);
      logEvent(`User ${msg.author.tag} checked bot status`);
    }
  },

  update: {
    description: "Updates bot status (for owner only)",
    execute: (msg, args) => {
      if (msg.author.id !== OWNER_ID) return msg.reply("You cannot use this command.");
      const newStatus = args.join(" ");
      serverModule.botSettings.statusMessage = newStatus;
      updateBotStatus();
      msg.reply(`Status updated to: ${newStatus}`);
      logEvent(`Owner updated status to: ${newStatus}`);
    }
  },

  updatecheck: {
    description: "Checks for updates from GitHub",
    execute: async (msg) => {
      if (!GITHUB_REPO) return msg.reply("GitHub repo not set.");
      try {
        const fetch = (await import("node-fetch")).default;
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        const data = await res.json();

        if (data && data.name) {
          msg.reply(`Latest release: **${data.name}** (${data.tag_name})`);
          logEvent(`User ${msg.author.tag} checked for updates`);
        } else {
          msg.reply("No release information found.");
        }
      } catch (err) {
        msg.reply("Failed to fetch updates.");
        logEvent(`Error fetching updates: ${err.message}`);
      }
    }
  },

  checkservers: {
    description: "Lists all servers this bot is currently in (DMs owner)",
    execute: async (msg) => {
      if (msg.author.id !== OWNER_ID) {
        return msg.reply("You cannot use this command.");
      }

      const guilds = client.guilds.cache.map(g => ({
        name: g.name,
        id: g.id,
        members: g.memberCount ?? "Unknown"
      }));

      if (guilds.length === 0) {
        msg.reply("I'm not in any servers right now.");
        return;
      }

      const list = guilds
        .map(g => `• **${g.name}** (${g.id}) — ${g.members} members`)
        .join("\n");

      try {
        await msg.author.send(`🤖 **Servers I'm in (${guilds.length}):**\n${list}`);
        msg.reply("📬 I’ve sent you a DM with the server list.");
        logEvent(`Owner ${msg.author.tag} used !checkservers (sent via DM).`);
      } catch (err) {
        msg.reply("⚠️ I couldn't DM you — please check your privacy settings.");
        logEvent(`Failed to DM server list to owner: ${err.message}`);
      }
    }
  }
};

// Message handler
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(serverModule.botSettings.prefix)) return;

  const args = msg.content.slice(serverModule.botSettings.prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (commands[cmd]) {
    try {
      commands[cmd].execute(msg, args);
    } catch (err) {
      msg.reply("Error executing command.");
      logEvent(`Command error (${cmd}): ${err.message}`);
    }
  }
});

// Bot ready event
client.once("ready", () => {
  logEvent(`Bot logged in as ${client.user.tag}`);
  updateBotStatus();
});

// Start server and then bot
serverModule.startServer(() => {
  logEvent("HTTP server started");
  client.login(DISCORD_TOKEN);
});

module.exports = client;
