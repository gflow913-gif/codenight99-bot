# 99 Nights in Forest - Discord Code Scraper Bot

A Discord bot that automatically searches the web for new "99 Nights in Forest" (Roblox game) redeem codes and notifies you when they're found.

## Features

- 🔍 **Automated Web Scraping**: Uses DuckDuckGo search to find code-related pages
- 🤖 **Smart Code Detection**: Extracts codes matching pattern `[A-Z0-9]{5,15}` with context validation
- 💾 **Duplicate Prevention**: Stores found codes in `codes.json` to avoid repeats
- 📢 **Discord Notifications**: Posts new codes to a channel and DMs a specific user
- ⏰ **Automatic Scanning**: Runs on startup and every 3 hours
- 🎯 **Manual Trigger**: Use `!check` command to scan on demand
- 📊 **Clear Logging**: Comprehensive console output for all activities

## Setup

### 1. Environment Variables

Set the following environment variables (in .env file or your hosting platform):

- `DISCORD_TOKEN` - Your Discord bot token (required)
- `GUILD_ID` - Your Discord server ID (optional)
- `CHANNEL_ID` - Channel ID where new codes will be posted (required)
- `USER_ID` - User ID who will receive DM notifications (required)
- `SESSION_SECRET` - Secret key for session management (optional)

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

The bot will automatically:
- Scan for codes when it starts
- Scan every 3 hours thereafter
- Respond to `/check` slash command for manual scans

## How It Works

1. **Search**: Queries DuckDuckGo for "99 Nights in Forest codes"
2. **Fallback**: If DuckDuckGo is rate-limited, switches to scraping known gaming code websites
3. **Scrape**: Fetches top 5 results and parses HTML with Cheerio
4. **Extract**: Finds codes matching `/([A-Z0-9]{5,15})/g` near keywords like "Code", "Reward", "Gift"
5. **Filter**: Compares against stored codes in `codes.json` to identify new ones (prevents duplicates even after restart)
6. **Notify**: Sends new codes to Discord channel and user DM
7. **Store**: Saves all codes to `codes.json` for persistent duplicate prevention

## Dependencies

- `discord.js` (v14.15.3) - Discord bot framework
- `duck-duck-scrape` (v2.1.0) - DuckDuckGo search without API key
- `cheerio` (v1.0.0) - HTML parsing and scraping
- `node-fetch` (v3.3.2) - HTTP requests

Dependencies are automatically installed on startup.

## Slash Commands

The bot uses Discord slash commands (just type `/` to see them):

- `/check` - Run automatic scan for new codes (all sources)
- `/scan <url>` - Scan a specific URL for codes (any user can use this)
- `/help` - Show all available commands

**How to use:**
1. Type `/` in Discord
2. Select a command from the autocomplete list
3. Fill in any required parameters (like URL for `/scan`)
4. Press Enter!

## Logs

The bot provides detailed console logging:
- ✅ Successful operations
- 🔍 Active scraping
- 🎉 New codes found
- ♻️ Duplicate codes detected
- ❌ Errors and warnings
