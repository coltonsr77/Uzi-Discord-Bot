# Uzi Discord Bot

My Uzi Doorman Bot for Discord — documentation and usage for the slash commands implemented in index.js.

## Overview

This bot uses discord.js to register and handle global slash commands. Commands are defined and registered automatically when the bot becomes ready. Replies are mostly ephemeral (visible only to the user who invoked the command), and some information (like the server list) is sent via DM to the bot owner.

## Requirements

- Node.js (v16.9.0+ recommended for discord.js v14 compatibility)
- npm or yarn
- A Discord bot application with:
  - Bot token
  - Application (client) ID
  - The bot invited to servers with appropriate permissions (application.commands & bot scopes if you want to invite the bot)

Dependencies used by the project (install via npm):
- discord.js
- dotenv
- node-fetch (used dynamically in index.js)

Example:
```bash
npm install discord.js dotenv node-fetch
```

## Environment variables

The bot expects the following environment variables (usually via a `.env` file):

- DISCORD_TOKEN — (required) your bot token.
- CLIENT_ID — (required) your bot application's client ID (used to register global commands).
- OWNER_ID — (required) Discord user ID of the bot owner (used to restrict owner-only commands).
- GITHUB_REPO — (optional) in the format `owner/repo` (e.g., `coltonsr77/Uzi-Discord-Bot`) used by `/updatecheck` to query the GitHub Releases API.

Example `.env`:
```
DISCORD_TOKEN=abc123...
CLIENT_ID=987654321012345678
OWNER_ID=123456789012345678
GITHUB_REPO=coltonsr77/Uzi-Discord-Bot
```

## How it runs

The bot does the following on startup:
- Logs in with DISCORD_TOKEN
- Sets presence (activity) to "Online" (WATCHING)
- Registers global slash commands using the CLIENT_ID and the REST API

Because commands are registered globally, it may take up to an hour to appear in all guilds the first time. Subsequent changes may also take time; for development, you can change registration to guild-scoped commands for faster propagation (not done in the current code).

## Available slash commands

All commands are registered as global slash commands. By default, replies are ephemeral.

1. /uzicmds
   - Description: Lists all commands.
   - Usage: `/uzicmds`
   - Behavior: Sends an ephemeral reply to the user listing every registered command, e.g.:
     ```
     Available commands:
     /uzicmds
     /uzistatus
     /update
     /updatecheck
     /checkservers
     ```

2. /uzistatus
   - Description: Shows current bot status.
   - Usage: `/uzistatus`
   - Behavior: Replies ephemeral with the current activity status. Index.js uses a default "Online" message on ready.

3. /update
   - Description: Updates bot status (owner only).
   - Usage: `/update status:<New status text>`
   - Options:
     - status (string, required) — the new status text to set.
   - Behavior:
     - Only the user whose ID matches OWNER_ID can use this command.
     - Sets the bot activity to the provided text (activity type WATCHING).
     - Replies ephemeral confirming the update, e.g. `✅ Status updated to: Maintenance mode`.

4. /updatecheck
   - Description: Checks latest GitHub release.
   - Usage: `/updatecheck`
   - Behavior:
     - Uses the GITHUB_REPO env var (owner/repo) to call `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`.
     - If a release is found, replies ephemeral with `Latest release: **<name>** (<tag_name>)`.
     - If GITHUB_REPO is not set, replies `GitHub repo not set.`
     - If fetching fails, replies `Failed to fetch updates.`

5. /checkservers
   - Description: Lists all servers this bot is in (owner only).
   - Usage: `/checkservers`
   - Behavior:
     - Only OWNER_ID can use this command.
     - Gathers guilds from `client.guilds.cache` and builds a list of name, id, and member count (falls back to "Unknown" if not present).
     - Attempts to send the list as a DM to the invoking user. If successful, replies ephemeral: `📬 I’ve sent you a DM with the server list.`
     - If it cannot DM (user privacy settings), replies ephemeral: `⚠️ I couldn't DM you — please check your privacy settings.`

## Permission notes

- Owner-only commands: `/update` and `/checkservers`. The bot enforces this by comparing `interaction.user.id` to `OWNER_ID`.
- The bot requires the Gateway Intent for Guilds (provided in index.js) to read basic guild information.
- For global command registration: CLIENT_ID and DISCORD_TOKEN must be valid and the token must have application scope to register application commands.

## Troubleshooting

- Commands not appearing immediately: Global commands can take up to an hour to propagate. For faster iteration during development, change registration to guild commands (not currently implemented).
- `GitHub repo not set.` — set GITHUB_REPO in your environment to use `/updatecheck`.
- DM fails on `/checkservers` — the owner needs to allow DMs from server members or adjust privacy settings so the bot can send DMs.
- `Failed to fetch updates.` — this can happen if GitHub rate-limits the request or if the repo name is incorrect.
- Ensure DISCORD_TOKEN, CLIENT_ID, and OWNER_ID are set or the bot will not start or will register commands incorrectly.

## Development & deployment

1. Clone repo
2. Install dependencies
   ```
   npm install
   ```
3. Create `.env` with the variables described above.
4. Run bot:
   ```
   node index.js
   ```
5. To keep the bot running in production, use a process manager (pm2, systemd, Docker, etc.).

## Customization tips

- To change the default activity type, modify `client.user.setActivity(..., { type: "WATCHING" })` in index.js.
- To register commands to a specific guild for faster testing, replace `Routes.applicationCommands(CLIENT_ID)` with `Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)` during development (requires GUILD_ID).

## Contact / Contributing

If you want changes to how commands behave or additions in the README, open an issue or PR in the repository. If you'd like, I can push this README to the repo or open a PR for you.
