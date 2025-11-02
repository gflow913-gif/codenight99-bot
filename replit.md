# 99 Nights in Forest - Discord Code Scraper Bot

## Overview
A Discord bot built with Node.js that automatically searches the web for new "99 Nights in Forest" (Roblox game) redeem codes and notifies users via Discord when new codes are discovered. The bot uses Serper.dev Google Search API to find relevant URLs, then scrapes those pages with Cheerio to extract codes. Designed to be standalone and portable for hosting on platforms like Replit.

## Current State
- **Status**: Fully functional and ready for deployment
- **Created**: November 2, 2025
- **Language**: Node.js (ES Modules)
- **Main File**: `index.js`
- **Game**: 99 Nights in Forest (Roblox)

## Recent Changes
- November 2, 2025: Project migrated to Replit environment with multi-server support
  - Created Discord bot with discord.js v14
  - Implemented Serper.dev Google Search API for reliable code discovery
  - Added web scraping with cheerio for code extraction
  - Added code extraction with regex pattern `/([A-Z0-9]{5,15})/g`
  - Implemented persistent storage in `codes.json` for duplicate prevention
  - **Updated scan interval to 1 hour** (from 3 hours) for faster code discovery
  - **Added multi-server support** with `servers.json` configuration storage
  - **Added `/thought` command** for server owners to set up their own notifications
  - Added permission checking (server owner only for `/thought`)
  - Updated notification system to support multiple servers simultaneously
  - Added automatic scanning (startup + every 1 hour)
  - Added manual scan trigger via `/check` slash command
  - Configured Discord notifications (channel + DM)
  - Added `/scan <url>` slash command for user-requested URL scanning
  - Added `/help` slash command to show all available commands
  - Improved message formatting (cleaner, numbered code lists)
  - All environment variables properly configured (DISCORD_TOKEN, CHANNEL_ID, USER_ID, GUILD_ID, SESSION_SECRET, SERPER_KEY)

## Project Architecture

### Core Components
- **Discord Bot** (`index.js`): Main application with bot logic
- **Web Search**: Serper.dev Google Search API → finds relevant URLs
- **Web Scraping**: Cheerio-based HTML parsing → code extraction
- **Storage**: JSON file (`codes.json`) for duplicate prevention
- **Notifications**: Discord channel posts + user DMs

### Key Features
1. Automated Google search using Serper.dev API for reliable results
2. HTML parsing with cheerio to extract codes from top 5 search results
3. Smart code detection with context validation (keywords: Code, Reward, Gift)
4. Duplicate prevention via persistent storage in `codes.json`
5. **Multi-server support** - Server owners can configure their own channels
6. **Scheduled scanning (1-hour intervals)** for faster code discovery
7. Discord integration for notifications (main channel + DM + all configured servers)
8. Server owner permission system for `/thought` command
9. Manual scan trigger slash command (`/check`)
10. User-friendly URL scanning slash command (`/scan <url>`)
11. Server setup slash command (`/thought`) for server owners
12. Help slash command for command list (`/help`)

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
