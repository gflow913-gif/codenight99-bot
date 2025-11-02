# 99 Nights in Forest - Discord Code Scraper Bot

A Discord bot that automatically searches the web for new "99 Nights in Forest" (Roblox game) redeem codes and notifies you when they're found.

## Features

- 🔍 **Google Search via Serper.dev**: Uses Serper API for reliable Google search results
- 🤖 **Smart Code Detection**: Extracts codes matching pattern `[A-Z0-9]{5,15}` with context validation
- 💾 **Duplicate Prevention**: Stores found codes in `codes.json` to avoid repeats (even after restarts)
- 📢 **Discord Notifications**: Posts new codes to a channel and DMs a specific user
- 🌐 **Multi-Server Support**: Server owners can configure their own channels with `/thought`
- ⏰ **Automatic Scanning**: Runs on startup and every 1 hour
- 🎯 **Slash Commands**: `/check` for manual scans, `/scan <url>` for specific URLs, `/thought` for server setup
- 📊 **Clear Logging**: Comprehensive console output for all activities

## Setup

### 1. Environment Variables

Set the following environment variables (in .env file or your hosting platform):

- `DISCORD_TOKEN` - Your Discord bot token (required)
- `SERPER_KEY` - Your Serper.dev API key for Google Search (required)
- `CHANNEL_ID` - Channel ID where new codes will be posted (required)
- `USER_ID` - User ID who will receive DM notifications (required)
- `GUILD_ID` - Your Discord server ID (optional)
- `SESSION_SECRET` - Secret key for session management (optional)

**Get Serper API Key:**
1. Go to [Serper.dev](https://serper.dev)
2. Sign up for a free account
3. Copy your API key and set it as `SERPER_KEY`

### 2. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token and set it as `DISCORD_TOKEN`
5. Enable "Message Content Intent" in the Bot settings (required for fallback)
6. Go to OAuth2 > URL Generator:
   - Scopes: `bot` + `applications.commands`
   - Bot Permissions: `Send Messages`, `Read Messages/View Channels`, `Send Messages in Threads`, `Use Slash Commands`
7. Use the generated URL to invite the bot to your server

### 3. Get Discord IDs

Enable Developer Mode in Discord (Settings > Advanced > Developer Mode), then:
- Right-click your server → Copy Server ID → `GUILD_ID`
- Right-click the channel → Copy Channel ID → `CHANNEL_ID`
- Right-click your username → Copy User ID → `USER_ID`

## Usage

**For Bot Owner:**
The bot will automatically:
- Scan for codes when it starts
- Scan every 1 hour thereafter
- Post to your configured channel and DM you

**For Other Servers:**
Server owners can use `/thought` command to:
- Set up automatic code notifications in their server
- Choose which channel receives the codes
- Get codes every 1 hour automatically

**Everyone Can:**
- Use `/check` to trigger a manual scan
- Use `/scan <url>` to check a specific URL for codes

## How It Works

1. **Search**: Queries Google via Serper.dev API for "99 Nights in Forest codes"
2. **Scrape**: Fetches top 5 results and parses HTML with Cheerio
3. **Extract**: Finds codes matching `/([A-Z0-9]{5,15})/g` near keywords like "Code", "Reward", "Gift"
4. **Filter**: Compares against stored codes in `codes.json` to identify new ones (prevents duplicates even after restart)
5. **Notify**: Sends new codes to Discord channel and user DM
6. **Store**: Saves all codes to `codes.json` for persistent duplicate prevention

## Dependencies

- `discord.js` (v14.15.3) - Discord bot framework
- `cheerio` (v1.0.0) - HTML parsing and scraping
- `node-fetch` (v3.3.2) - HTTP requests

**External APIs:**
- Serper.dev - Google Search API (requires API key)

Dependencies are automatically installed on startup.

## Slash Commands

The bot uses Discord slash commands (just type `/` to see them):

- `/check` - Run automatic scan for new codes (anyone can use)
- `/scan <url>` - Scan a specific URL for codes (anyone can use)
- `/thought` - Setup notifications for your server (server owner only)
- `/help` - Show all available commands

**How to use:**
1. Type `/` in Discord
2. Select a command from the autocomplete list
3. Fill in any required parameters (like channel for `/thought` or URL for `/scan`)
4. Press Enter!

**Server Owner Setup:**
1. Invite the bot to your server
2. Use `/thought` command
3. Select the channel where you want codes posted
4. Done! Your server will now receive automatic updates every 1 hour

## Logs

The bot provides detailed console logging:
- ✅ Successful operations
- 🔍 Active scraping
- 🎉 New codes found
- ♻️ Duplicate codes detected
- ❌ Errors and warnings
