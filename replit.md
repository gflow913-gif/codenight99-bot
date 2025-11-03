# Multi-Game Roblox Code Scraper Bot

## Overview
A Discord bot built with Node.js that automatically searches the web for Roblox game redeem codes and notifies users via Discord when new codes are discovered. The bot uses Serper.dev Google Search API to find relevant URLs, then scrapes those pages with Cheerio to extract codes. Features an interactive UI with ephemeral (private) responses for individual code viewing. Designed to be standalone and portable for hosting on any platform.

## Current State
- **Status**: Fully functional and ready for deployment
- **Created**: November 2, 2025
- **Last Updated**: November 3, 2025
- **Language**: Node.js (ES Modules)
- **Main File**: `index.js`
- **Supported Games**: 5 Roblox games

## Recent Changes
- November 3, 2025: Major UI update with interactive commands and new games
  - **Added 2 new games**: Blox Fruits and Steal a Brainrot (now 5 total games)
  - **Added `/codes` command** with interactive select menu for private code viewing
  - **Made all code responses ephemeral** (only visible to requesting user)
  - Updated `/scan` command to use embeds and ephemeral responses
  - Updated `/help` command to use rich embeds with ephemeral responses
  - Added game emojis for better visual identification
  - Improved UX with select menu that disappears after selection
  - All commands updated to support all 5 games

- November 2, 2025: Project migrated to Replit environment with multi-server support
  - Created Discord bot with discord.js v14
  - Implemented Serper.dev Google Search API for reliable code discovery
  - Added web scraping with cheerio for code extraction
  - Implemented persistent storage in `codes.json` for duplicate prevention
  - **Updated scan interval to 1 hour** for faster code discovery
  - **Added multi-server support** with `servers.json` configuration storage
  - **Added `/setup` command** for server owners to configure notifications
  - Added permission checking (server owner only for `/setup`)
  - Updated notification system to support multiple servers simultaneously
  - Added automatic scanning (startup + every 1 hour)
  - Added manual scan trigger via `/check` slash command
  - Added `/scan <url>` slash command for user-requested URL scanning
  - Added `/unsetup` command to remove notifications
  - All environment variables properly configured (DISCORD_TOKEN, CHANNEL_ID, USER_ID, GUILD_ID, SESSION_SECRET, SERPER_KEY)

## Project Architecture

### Core Components
- **Discord Bot** (`index.js`): Main application with bot logic
- **Web Search**: Serper.dev Google Search API → finds relevant URLs
- **Web Scraping**: Cheerio-based HTML parsing → code extraction
- **Storage**: JSON file (`codes.json`) for duplicate prevention
- **Notifications**: Discord channel posts + user DMs

### Key Features
1. **5 Supported Games**: 99 Nights in the Forest, Grow a Garden, Fisch, Blox Fruits, Steal a Brainrot
2. **Interactive Code Viewing**: `/codes` command with select menu for private code viewing
3. **Ephemeral Responses**: All code displays are private (only visible to requesting user)
4. Automated Google search using Serper.dev API for reliable results
5. HTML parsing with cheerio to extract codes from top 5 search results
6. Smart code detection with context validation (keywords: Code, Reward, Gift)
7. Duplicate prevention via persistent storage in `codes.json`
8. **Multi-server support** - Server owners can configure their own channels
9. **Scheduled scanning (1-hour intervals)** for faster code discovery
10. Discord integration for notifications (main channel + all configured servers)
11. Server owner permission system for `/setup` command
12. Manual scan trigger slash command (`/check`)
13. User-friendly URL scanning slash command (`/scan <url> <game>`)
14. Server setup slash command (`/setup`) for server owners
15. Rich embed help command (`/help`) with all features explained
16. Game emojis for visual identification (🌲 🌺 🎣 🍇 🧠)

### Dependencies
- `discord.js` (^14.15.3) - Discord bot framework
- `cheerio` (^1.0.0) - HTML parsing
- `node-fetch` (^3.3.2) - HTTP requests
- `fs` (built-in) - File system operations

### Environment Variables Required
- `DISCORD_TOKEN` - Bot authentication token (required)
- `SERPER_KEY` - Serper.dev API key for Google search (required)
- `CHANNEL_ID` - Target channel for code notifications (required)
- `USER_ID` - User to receive DM notifications (required)
- `GUILD_ID` - Discord server ID (optional)
- `SESSION_SECRET` - Secret key for session management (optional)

### File Structure
```
/
├── index.js          # Main bot application
├── package.json      # NPM dependencies and config
├── codes.json        # Stored codes database
├── servers.json      # Multi-server configurations
├── .gitignore        # Git ignore rules
├── README.md         # User documentation
└── replit.md         # Project memory/documentation
```

## User Preferences
- Prefers using environment variables for configuration
- Wants automatic dependency installation with fallback script
- Requires comprehensive console logging
- Uses async/await coding style
- Needs standalone operation (no terminal interaction)
