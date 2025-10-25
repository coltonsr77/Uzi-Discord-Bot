# Uzi-Doorman-Bot

Uzi-Doorman-Bot is a small, focused Discord bot that role-plays as Uzi Doorman (from Murder Drones) and provides a few useful owner/admin utilities. This README was updated to match the behavior and commands implemented in index.js.

## Key Features
- Roleplay responses inspired by Uzi Doorman
- Slash commands (registered globally on startup)
- Owner-only utilities for updating status and listing servers
- Optional GitHub release check (requires GITHUB_REPO)

## Slash Commands
These commands are implemented and registered by index.js on startup:

- `/uzicmds` — Lists all available bot commands (ephemeral reply)
- `/uzistatus` — Shows the current bot status (ephemeral reply)
- `/update` — Owner-only. Updates the bot status. Usage: `/update status:<text>`
- `/updatecheck` — Checks the latest GitHub release for the repository configured in GITHUB_REPO (ephemeral reply)
- `/checkservers` — Owner-only. Sends the owner a DM listing all servers the bot is in

Notes:
- Owner-only commands check the OWNER_ID environment variable.
- Global slash commands are registered using the CLIENT_ID and DISCORD_TOKEN.

## Environment Variables
Create a `.env` file (copy from `.env.example`) and set these values:

- DISCORD_TOKEN=<your-bot-token>         # required
- CLIENT_ID=<your-application-client-id> # required (used to register global slash commands)
- OWNER_ID=<your-user-id>                # required for owner-only commands
- GITHUB_REPO=<owner/repo>               # optional; used by `/updatecheck` (example: coltonsr77/Uzi-Discord-Bot)

Example `.env` (do not commit secrets):
```env
DISCORD_TOKEN=your_token_here
CLIENT_ID=123456789012345678
OWNER_ID=987654321098765432
GITHUB_REPO=coltonsr77/Uzi-Discord-Bot
```

## Installation

1. Clone the repo:
```bash
git clone https://github.com/coltonsr77/Uzi-Discord-Bot.git
cd Uzi-Discord-Bot
```

2. Install dependencies:
```bash
npm install
```

3. Copy and fill in environment variables:
```bash
cp .env.example .env
# edit .env and add your values
```

4. Run the bot:
```bash
node index.js
```

On startup the bot will:
- Log in with DISCORD_TOKEN
- Register global slash commands for the application ID in CLIENT_ID
- Set the initial activity to "Online" and log startup events to the console

## Requirements
- Node.js 18+ (recommended). The code uses dynamic import and modern APIs that work reliably on Node 18 and newer.

## Behavior Details / Implementation Notes
- The bot uses discord.js and registers global slash commands using REST + Routes.applicationCommands(CLIENT_ID).
- `/updatecheck` calls the GitHub releases API for the value in GITHUB_REPO; set that env var if you want the feature to work.
- Owner-only commands compare interaction.user.id to OWNER_ID.
- `/checkservers` attempts to DM the owner a formatted list of guild names, IDs, and member counts. If the DM fails, the bot replies ephemerally with an error.

## Troubleshooting
- "Invalid token" on login — verify DISCORD_TOKEN.
- Commands not appearing — ensure CLIENT_ID is set and the bot has permissions; the bot registers global commands on startup (may take up to an hour to appear across all guilds due to Discord propagation).
- `/updatecheck` returns "GitHub repo not set." — add GITHUB_REPO to `.env`.
- Can't DM owner — ensure the owner's privacy settings allow server members (or the bot) to DM them.

## Contributing
Contributions, issues, and pull requests are welcome. For quick help or discussion you can join the project's Discord server: https://discord.gg/Rm4QAxfR

If you change commands or environment names in code, please update this README to match.

## License
MIT License — feel free to use and modify as needed.
