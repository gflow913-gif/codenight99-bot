# 99 Days in Forest - Discord Code Scraper Bot

## Overview
A Discord bot built with Node.js that automatically searches the web for new "99 Days in Forest" (Roblox game) redeem codes and notifies users via Discord when new codes are discovered. The bot uses web scraping with DuckDuckGo search (with fallback URLs) and Cheerio to find and extract codes. Designed to be standalone and portable for hosting on platforms like Pella.

## Current State
- **Status**: Fully functional and ready for deployment
- **Created**: November 2, 2025
- **Language**: Node.js (ES Modules)
- **Main File**: `index.js`
- **Game**: 99 Days in Forest (Roblox)

## Recent Changes
- November 2, 2025: Initial project setup and refinement
  - Created Discord bot with discord.js v14
  - Implemented web scraping with duck-duck-scrape and cheerio
  - Added code extraction with regex pattern `/([A-Z0-9]{5,15})/g`
  - Implemented persistent storage in `codes.json` for duplicate prevention
  - Added automatic scanning (startup + every 3 hours)
  - Added manual scan trigger via `!check` command
  - Configured Discord notifications (channel + DM)
  - Fixed deprecation warning (ready → clientReady)
  - Added fallback URL scraping for when DuckDuckGo is rate-limited
  - Corrected game name to "99 Days in Forest"
  - Added SESSION_SECRET environment variable
  - Updated for standalone deployment on external platforms
  - Enhanced .gitignore for proper version control

## Project Architecture

### Core Components
- **Discord Bot** (`index.js`): Main application with bot logic
- **Web Scraping**: DuckDuckGo search → URL scraping → code extraction
- **Storage**: JSON file (`codes.json`) for duplicate prevention
- **Notifications**: Discord channel posts + user DMs

### Key Features
1. Automated web search using duck-duck-scrape (no API key needed)
2. HTML parsing with cheerio to extract codes
3. Smart code detection with context validation (keywords: Code, Reward, Gift)
4. Duplicate prevention via persistent storage
5. Scheduled scanning (3-hour intervals)
6. Discord integration for notifications
7. Manual scan trigger command

### Dependencies
- `discord.js` (^14.15.3) - Discord bot framework
- `duck-duck-scrape` (^2.1.0) - Web search without API
- `cheerio` (^1.0.0) - HTML parsing
- `node-fetch` (^3.3.2) - HTTP requests
- `fs` (built-in) - File system operations

### Environment Variables Required
- `DISCORD_TOKEN` - Bot authentication token (required)
- `GUILD_ID` - Discord server ID (optional)
- `CHANNEL_ID` - Target channel for code notifications (required)
- `USER_ID` - User to receive DM notifications (required)
- `SESSION_SECRET` - Secret key for session management (optional)

### File Structure
```
/
├── index.js          # Main bot application
├── package.json      # NPM dependencies and config
├── codes.json        # Stored codes database
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
