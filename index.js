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
const { spawn } = require("child_process");
const path = require("path");

// Run test.js safely
const testScript = path.join(__dirname, "test.js");
const testProcess = spawn("node", [testScript], { stdio: "inherit" });

testProcess.on("close", code => {
  console.log(`test.js exited with code ${code}`);
});

// Load environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const OWNER_ID = process.env.OWNER_ID;
const GITHUB_REPO = process.env.GITHUB_REPO || "";

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});
client.commands = new Collection();

// Define slash commands
const commandsData = [
  new SlashCommandBuilder().setName("ping").setDescription("Check bot response"),
  new SlashCommandBuilder().setName("changelog").setDescription("Show recent commits from the GitHub repository")
];

// Register global commands
async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commandsData.map(cmd => cmd.toJSON())
    });
    console.log("Commands registered globally");
  } catch (err) {
    console.error("Command registration failed:", err);
  }
}

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (interaction.commandName === "changelog") {
    if (!GITHUB_REPO) {
      return interaction.reply({
        content: "GitHub repository not set in .env",
        ephemeral: false
      });
    }

    try {
      const fetch = (await import("node-fetch")).default;
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=5`
      );
      const commits = await res.json();

      const embed = new EmbedBuilder()
        .setTitle(`Latest Commits from ${GITHUB_REPO}`)
        .setColor(0x2b2d31);

      for (const commit of commits) {
        embed.addFields({
          name: commit.commit.message.split("\n")[0],
          value: `[View Commit](${commit.html_url})`
        });
      }

      // Public reply (visible to everyone)
      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (err) {
      console.error("Error fetching commits:", err);
      await interaction.reply({
        content: "Failed to load changelog",
        ephemeral: false
      });
    }
  }
});

// Ready event
client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await registerCommands();
});

// Login to Discord
client.login(DISCORD_TOKEN);
