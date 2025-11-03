
import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } from 'discord.js';
import { load } from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';

// Game configurations
const GAMES = {
  '99nights': {
    name: '99 Nights in the Forest',
    emoji: '🌲',
    searchQuery: '99 Nights in Forest codes',
    codePattern: /\b(\d{14}|[a-z]{8,15}|[A-Z]{6,15}|[A-Z][a-z0-9]{5,14})\b/g,
    keywords: ['code', 'reward', 'gift', 'redeem', 'promo', 'coupon', 'free', 'diamonds', 'gems', 'working', 'active', 'new', 'latest', 'valid', 'expired'],
    blacklist: ['http', 'https', 'false', 'true', 'null', 'undefined', 'error', 'success', 'failed', 'admin', 'login', 'logout', 'button', 'click', 'enter', 'submit', 'cancel', 'confirm', 'delete', 'update', 'create', 'twitter', 'youtube', 'discord', 'facebook', 'instagram', 'github', 'google', 'chrome', 'firefox', 'safari', 'january', 'february', 'march', 'april', 'august', 'september', 'october', 'november', 'december', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'forest', 'nights', 'roblox', 'games', 'please', 'thank', 'welcome', 'hello', 'world', 'server', 'client', 'player', 'cookie', 'session', 'script', 'function', 'return', 'console', 'window', 'document', 'article', 'section', 'header', 'footer', 'content', 'title', 'image', 'video', 'audio', 'table', 'border', 'mobile', 'desktop', 'tablet', 'android', 'iphone', 'windows', 'linux', 'macos', 'about', 'contact', 'privacy', 'terms', 'policy', 'support', 'help', 'marvel', 'piece', 'doors', 'englishmiddle', 'brand', 'sensitive', 'pokemon', 'howlongtobeat', 'eurogamer', 'maxroll', 'global', 'authority', 'diamond', 'snapchat', 'spotify', 'apple', 'netflix', 'disney', 'anime', 'entertainment', 'more', 'that', 'this', 'with', 'from', 'have', 'been', 'your', 'them', 'here', 'then', 'some', 'time', 'only', 'also', 'like', 'just', 'know', 'take', 'into', 'year', 'good', 'make', 'over', 'such', 'even', 'most', 'other', 'these']
  },
  'growagarden': {
    name: 'Grow a Garden',
    emoji: '🌺',
    searchQuery: 'Grow a Garden Roblox codes',
    codePattern: /\b([A-Z0-9]{6,8}|[A-Z]{6,10}|[a-z]{8,12})\b/g,
    keywords: ['code', 'reward', 'gift', 'redeem', 'promo', 'free', 'coins', 'gems', 'working', 'active', 'new', 'latest', 'valid', 'expired'],
    blacklist: ['http', 'https', 'false', 'true', 'null', 'roblox', 'game', 'grow', 'garden', 'play', 'about', 'contact', 'privacy', 'terms', 'policy', 'support', 'help', 'discord', 'snapchat', 'spotify', 'apple', 'android', 'netflix', 'marvel', 'piece', 'disney', 'entertainment', 'paced', 'more', 'that', 'this', 'with', 'from', 'have', 'been', 'your', 'them', 'here', 'then', 'some', 'time', 'only', 'also']
  },
  'fischit': {
    name: 'Fisch',
    emoji: '🎣',
    searchQuery: 'Fisch Roblox codes',
    codePattern: /\b([A-Z]{6,20}|[a-z]{8,15})\b/g,
    keywords: ['code', 'reward', 'gift', 'redeem', 'promo', 'free', 'cash', 'money', 'working', 'active', 'new', 'latest', 'valid', 'expired'],
    blacklist: ['http', 'https', 'false', 'true', 'null', 'roblox', 'game', 'fish', 'fisch', 'fishing', 'about', 'contact', 'privacy', 'terms', 'policy', 'support', 'help', 'more', 'that', 'this', 'with', 'from', 'have', 'been', 'your', 'them', 'here', 'then', 'some', 'time', 'only', 'also', 'like', 'just', 'know', 'take', 'into', 'year', 'good', 'make', 'over', 'such', 'even', 'most', 'other', 'these', 'discord', 'snapchat', 'spotify', 'apple', 'android', 'netflix', 'marvel', 'anime', 'piece', 'disney', 'tier', 'active', 'code', 'type', 'area', 'press', 'enter', 'input', 'redeem', 'world', 'free', 'acidic', 'mimic', 'carbon', 'englishmiddle', 'brand', 'entertainment', 'locations', 'location', 'news', 'lego', 'pokemon', 'borderlands', 'board', 'howlongtobeat', 'eurogamer', 'rock', 'maxroll']
  },
  'bloxfruits': {
    name: 'Blox Fruits',
    emoji: '🍇',
    searchQuery: 'Blox Fruits codes',
    codePattern: /\b([A-Z]{4,20}|[A-Z][a-z0-9_]{5,19}|SUB2[A-Z0-9]+|[A-Z0-9_]{6,20})\b/g,
    keywords: ['code', 'reward', 'gift', 'redeem', 'promo', 'free', 'exp', 'beli', 'reset', 'boost', 'working', 'active', 'new', 'latest', 'valid', 'expired'],
    blacklist: ['http', 'https', 'false', 'true', 'null', 'undefined', 'roblox', 'game', 'blox', 'fruits', 'fruit', 'about', 'contact', 'privacy', 'terms', 'policy', 'support', 'help', 'discord', 'twitter', 'youtube', 'facebook', 'instagram', 'more', 'that', 'this', 'with', 'from', 'have', 'been', 'your', 'them', 'here', 'then', 'some', 'time', 'only', 'also', 'like', 'just', 'know', 'take', 'into', 'year', 'good', 'make', 'update', 'create', 'delete', 'player', 'server', 'client']
  },
  'stealabrainrot': {
    name: 'Steal a Brainrot',
    emoji: '🧠',
    searchQuery: 'Steal a Brainrot codes',
    codePattern: /\b([A-Z]{5,12}|[A-Z][a-z]{4,11}|[A-Z0-9]{6,12})\b/g,
    keywords: ['code', 'reward', 'gift', 'redeem', 'promo', 'free', 'brainrot', 'cash', 'money', 'working', 'active', 'new', 'latest', 'valid', 'expired'],
    blacklist: ['http', 'https', 'false', 'true', 'null', 'roblox', 'game', 'steal', 'brainrot', 'about', 'contact', 'privacy', 'terms', 'policy', 'support', 'help', 'discord', 'more', 'that', 'this', 'with', 'from', 'have', 'been', 'your', 'them', 'here', 'then', 'some', 'time', 'only', 'also']
  }
};

// Configuration from environment variables
const CONFIG = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  GUILD_ID: process.env.GUILD_ID,
  CHANNEL_ID: process.env.CHANNEL_ID,
  USER_ID: process.env.USER_ID,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SERPER_KEY: process.env.SERPER_KEY,
  SCAN_INTERVAL: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
  CODES_FILE: 'codes.json',
  SERVERS_FILE: 'servers.json'
};

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// Helper function to get date N days ago in YYYY-MM-DD format
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Load stored codes from file
function loadStoredCodes() {
  try {
    if (fs.existsSync(CONFIG.CODES_FILE)) {
      const data = fs.readFileSync(CONFIG.CODES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading stored codes:', error.message);
  }
  return {};
}

// Save codes to file
function saveStoredCodes(codes) {
  try {
    fs.writeFileSync(CONFIG.CODES_FILE, JSON.stringify(codes, null, 2));
    const totalCodes = Object.values(codes).reduce((sum, gameCodes) => sum + gameCodes.length, 0);
    console.log(`💾 Saved ${totalCodes} total codes across ${Object.keys(codes).length} game(s)`);
  } catch (error) {
    console.error('❌ Error saving codes:', error.message);
  }
}

// Load server configurations
function loadServerConfigs() {
  try {
    if (fs.existsSync(CONFIG.SERVERS_FILE)) {
      const data = fs.readFileSync(CONFIG.SERVERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading server configs:', error.message);
  }
  return [];
}

// Save server configurations
function saveServerConfigs(servers) {
  try {
    fs.writeFileSync(CONFIG.SERVERS_FILE, JSON.stringify(servers, null, 2));
    console.log(`💾 Saved ${servers.length} server configuration(s)`);
  } catch (error) {
    console.error('❌ Error saving server configs:', error.message);
  }
}

// Extract potential codes from text
function extractCodes(text, url, gameId) {
  const game = GAMES[gameId];
  if (!game) return [];

  const potentialCodes = [];
  
  // Check if page mentions expired codes - skip entirely if so
  const textLower = text.toLowerCase();
  const expiredIndicators = ['expired', 'no longer valid', 'not working', 'outdated', 'removed', 'old codes', 'inactive'];
  const hasExpiredSection = expiredIndicators.some(indicator => textLower.includes(indicator));
  
  // Clean text: remove extra whitespace and normalize
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const lines = cleanText.split(/[.!?\n]+/);
  
  // Extended common words to filter out
  const extendedCommonWords = [
    'more', 'that', 'this', 'with', 'from', 'have', 'been', 'your', 'them', 'here', 'then', 
    'some', 'time', 'only', 'also', 'like', 'just', 'know', 'take', 'into', 'year', 'good', 
    'make', 'over', 'such', 'even', 'most', 'other', 'these', 'about', 'when', 'what', 'which',
    'their', 'would', 'there', 'could', 'first', 'after', 'where', 'before', 'through', 'during',
    'each', 'being', 'those', 'both', 'either', 'between', 'under', 'since', 'without', 'another',
    'should', 'might', 'while', 'still', 'never', 'always', 'every', 'until', 'though', 'against',
    'review', 'reviews', 'gaming', 'games', 'codes', 'guide', 'guides', 'news', 'article', 'store',
    'board', 'forum', 'wiki', 'fandom', 'community', 'official', 'latest', 'updated', 'version',
    'download', 'install', 'website', 'online', 'platform', 'service', 'account', 'profile',
    'settings', 'options', 'menu', 'search', 'filter', 'category', 'tags', 'share', 'comment'
  ];
  
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    
    // Skip lines that mention expired/outdated
    if (expiredIndicators.some(indicator => lineLower.includes(indicator))) {
      continue;
    }
    
    // Must contain at least TWO strong keywords to be considered
    const strongKeywords = ['code', 'redeem', 'reward', 'gift', 'promo'];
    const keywordCount = strongKeywords.filter(keyword => lineLower.includes(keyword)).length;
    if (keywordCount < 1) continue;
    
    // Extract potential codes from this line
    const matches = line.match(game.codePattern) || [];
    
    for (const code of matches) {
      const codeLower = code.toLowerCase();
      
      // Skip if blacklisted
      if (game.blacklist.includes(codeLower)) continue;
      
      // Skip extended common words
      if (extendedCommonWords.includes(codeLower)) continue;
      
      // Skip if already found
      if (potentialCodes.includes(code)) continue;
      
      // Stricter length requirements
      if (code.length < 5 || code.length > 15) continue;
      
      // Skip if all same character (like "aaaaa")
      if (/^(.)\1+$/.test(code)) continue;
      
      // Skip if it's a common English word pattern (vowel-consonant alternation)
      if (/^[aeiou][^aeiou][aeiou][^aeiou]/i.test(code) && code.length < 8) continue;
      
      // For non-numeric codes, require VERY strong validation
      if (!/^\d+$/.test(code)) {
        const codeIndex = line.indexOf(code);
        const nearContext = line.substring(Math.max(0, codeIndex - 60), Math.min(line.length, codeIndex + code.length + 60)).toLowerCase();
        
        // Very strong indicators that this is actually a code
        const veryStrongIndicators = ['code:', 'redeem:', 'enter code', 'use code', 'promo code:', 'gift code:', 'reward code:', 'copy code'];
        const hasVeryStrongIndicator = veryStrongIndicators.some(indicator => nearContext.includes(indicator));
        
        // If it's in a code list format (e.g., "- CODE" or "• CODE" or "1. CODE")
        const isInCodeList = /[\-•*]\s*$|^\d+\.\s*/.test(line.substring(Math.max(0, codeIndex - 5), codeIndex));
        
        // Must have very strong indicator OR be in a clear code list
        if (!hasVeryStrongIndicator && !isInCodeList) {
          // Exception: if it's ALL CAPS, 6+ characters, and has numbers
          if (!/^[A-Z0-9]+$/.test(code) || code.length < 6 || !/\d/.test(code)) {
            continue;
          }
        }
        
        // Additional validation: must be mostly uppercase or have specific patterns
        const uppercaseRatio = (code.match(/[A-Z]/g) || []).length / code.length;
        const hasNumbers = /\d/.test(code);
        
        if (uppercaseRatio < 0.5 && !hasNumbers) {
          continue; // Skip codes that are mostly lowercase without numbers
        }
      }
      
      potentialCodes.push(code);
    }
  }
  
  return potentialCodes.map(code => ({ code, source: url, game: gameId }));
}

// Scrape a URL for codes
async function scrapeUrl(url, gameId) {
  try {
    console.log(`🔍 Scraping: ${url}`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`⚠️ Failed to fetch ${url}: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Remove scripts, styles, and navigation elements
    $('script, style, nav, header, footer, .navigation, .menu, .sidebar, .ad, .advertisement').remove();
    
    // Focus on main content areas
    const contentAreas = $('main, article, .content, .post, .codes, .code-list, body').text();
    
    const codes = extractCodes(contentAreas, url, gameId);
    
    return codes;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`❌ Timeout scraping ${url}`);
    } else {
      console.error(`❌ Error scraping ${url}:`, error.message);
    }
    return [];
  }
}

// Search for codes using Serper.dev Google Search API
async function searchForCodes(gameId) {
  const game = GAMES[gameId];
  console.log(`\n🔎 Starting Google Search for "${game.searchQuery}" via Serper.dev...`);
  
  if (!CONFIG.SERPER_KEY) {
    console.error('❌ SERPER_KEY not configured! Cannot perform search.');
    return [];
  }
  
  try {
    // Search for codes with better query
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': CONFIG.SERPER_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `"${game.searchQuery}" "working codes" OR "active codes" 2025`,
        num: 15,
        tbs: 'qdr:w' // Filter to last week for freshness
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Serper API error (${response.status}): ${errorText}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.organic || data.organic.length === 0) {
      console.log('⚠️ No search results found from Serper API');
      return [];
    }
    
    console.log(`📋 Found ${data.organic.length} search results for ${game.name}`);
    
    // Blacklist unreliable domains that often block scraping or have low-quality content
    const blockedDomains = ['sourceforge.net', 'mmojugg.com', 'facebook.com', 'tiktok.com', 'pinterest.com', 'reddit.com'];
    
    // Filter and prioritize reliable gaming sites
    const trustedSites = ['ign.com', 'pcgamer.com', 'gamerant.com', 'thegamer.com', 'destructoid.com', 'polygon.com', 'eurogamer.net', 'rockpapershotgun.com', 'kotaku.com', 'fandom.com'];
    
    const filteredResults = data.organic.filter(result => {
      const url = result.link.toLowerCase();
      
      // Skip blocked domains
      if (blockedDomains.some(domain => url.includes(domain))) {
        console.log(`   ⏭️ Skipping blocked domain: ${result.link}`);
        return false;
      }
      
      // Skip if title/snippet suggests it's not about codes
      const combined = (result.title + ' ' + (result.snippet || '')).toLowerCase();
      if (!combined.includes('code') && !combined.includes('redeem')) {
        return false;
      }
      
      return true;
    });
    
    // Prioritize trusted sites first
    const prioritizedResults = [
      ...filteredResults.filter(r => trustedSites.some(site => r.link.toLowerCase().includes(site))),
      ...filteredResults.filter(r => !trustedSites.some(site => r.link.toLowerCase().includes(site)))
    ];
    
    const topResults = prioritizedResults.slice(0, 5);
    console.log(`📊 Scraping ${topResults.length} filtered results`);
    
    const allCodes = [];
    
    for (const result of topResults) {
      if (result.link) {
        console.log(`   🔗 Scraping: ${result.title}`);
        const codes = await scrapeUrl(result.link, gameId);
        if (codes.length > 0) {
          console.log(`      ✨ Found ${codes.length} potential code(s)`);
        }
        allCodes.push(...codes);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ Extracted ${allCodes.length} potential codes for ${game.name}`);
    return allCodes;
  } catch (error) {
    console.error('❌ Search error:', error.message);
    return [];
  }
}

// Check for new codes and notify
async function checkForNewCodes() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 STARTING CODE SCAN');
  console.log('='.repeat(60));
  
  const storedCodes = loadStoredCodes();
  const serverConfigs = loadServerConfigs();
  
  // Get all unique games being tracked
  const trackedGames = new Set();
  serverConfigs.forEach(config => {
    if (config.games) {
      config.games.forEach(game => trackedGames.add(game));
    }
  });
  
  if (trackedGames.size === 0) {
    console.log('⚠️ No games are being tracked by any server. Use /setup to configure.');
    return;
  }
  
  const allNewCodes = {};
  
  for (const gameId of trackedGames) {
    const game = GAMES[gameId];
    console.log(`\n📦 Checking ${game.name}...`);
    
    if (!storedCodes[gameId]) {
      storedCodes[gameId] = [];
    }
    
    const storedCodeStrings = storedCodes[gameId].map(c => c.code);
    const foundCodes = await searchForCodes(gameId);
    const newCodes = foundCodes.filter(found => !storedCodeStrings.includes(found.code));
    
    if (newCodes.length > 0) {
      console.log(`🎉 FOUND ${newCodes.length} NEW CODE(S) for ${game.name}!`);
      newCodes.forEach(({ code, source }) => {
        console.log(`   ✨ ${code} (from ${source})`);
      });
      
      storedCodes[gameId].push(...newCodes.map(c => ({
        code: c.code,
        source: c.source,
        foundAt: new Date().toISOString()
      })));
      
      allNewCodes[gameId] = newCodes;
    } else {
      console.log(`📭 No new codes found for ${game.name}`);
    }
  }
  
  saveStoredCodes(storedCodes);
  
  if (Object.keys(allNewCodes).length > 0) {
    await sendNotifications(allNewCodes);
  }
  
  console.log('='.repeat(60));
  console.log('✅ SCAN COMPLETE');
  console.log('='.repeat(60) + '\n');
}

// Send notifications to Discord
async function sendNotifications(newCodesByGame) {
  const serverConfigs = loadServerConfigs();
  
  for (const config of serverConfigs) {
    if (!config.games || config.games.length === 0) continue;
    
    try {
      const channel = await client.channels.fetch(config.channelId);
      if (!channel || !channel.isTextBased()) continue;
      
      // Group all new codes by game for this notification
      const hasNewCodes = Object.keys(newCodesByGame).some(gameId => 
        config.games.includes(gameId) && newCodesByGame[gameId].length > 0
      );
      
      if (!hasNewCodes) continue;
      
      // Send a summary header
      const totalNewCodes = Object.keys(newCodesByGame)
        .filter(gameId => config.games.includes(gameId))
        .reduce((sum, gameId) => sum + newCodesByGame[gameId].length, 0);
      
      await channel.send(`🎉 **New Codes Found!** 🎉\n📊 Total: **${totalNewCodes}** new code${totalNewCodes > 1 ? 's' : ''}\n⏰ ${new Date().toLocaleString()}\n${'─'.repeat(40)}`);
      
      // Send codes organized by game category
      for (const gameId of config.games) {
        if (!newCodesByGame[gameId] || newCodesByGame[gameId].length === 0) continue;
        
        const game = GAMES[gameId];
        const codes = newCodesByGame[gameId];
        
        // Create formatted code list
        const codeList = codes.map((c, i) => `\`${c.code}\``);
        
        // Split into chunks to avoid Discord's 2000 character limit
        const maxCodesPerMessage = 20;
        for (let i = 0; i < codeList.length; i += maxCodesPerMessage) {
          const chunk = codeList.slice(i, i + maxCodesPerMessage);
          const isFirst = i === 0;
          const isLast = i + maxCodesPerMessage >= codeList.length;
          
          let message = '';
          if (isFirst) {
            message += `\n🎮 **${game.name}** (${codes.length} code${codes.length > 1 ? 's' : ''})\n`;
          }
          message += chunk.join(' • ');
          if (isLast) {
            message += '\n';
          }
          
          await channel.send(message);
        }
        
        console.log(`✅ Posted ${codes.length} ${game.name} codes to ${config.guildName}`);
      }
      
      await channel.send(`${'─'.repeat(40)}\n✅ All codes posted!`);
      
    } catch (error) {
      console.error(`❌ Error posting to server ${config.guildId}:`, error.message);
    }
  }
}

// Register slash commands
async function registerCommands(clientId) {
  const commands = [
    new SlashCommandBuilder()
      .setName('codes')
      .setDescription('View available codes for different games'),
    new SlashCommandBuilder()
      .setName('post-menu')
      .setDescription('Post the code menu in this channel (Server Owner only)'),
    new SlashCommandBuilder()
      .setName('setup')
      .setDescription('Setup code notifications for your server (Server Owner only)')
      .addChannelOption(option =>
        option.setName('channel')
          .setDescription('The channel where codes will be posted')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('games')
          .setDescription('Which games to track')
          .setRequired(true)
          .addChoices(
            { name: '99 Nights in the Forest', value: '99nights' },
            { name: 'Grow a Garden', value: 'growagarden' },
            { name: 'Fisch', value: 'fischit' },
            { name: 'Blox Fruits', value: 'bloxfruits' },
            { name: 'Steal a Brainrot', value: 'stealabrainrot' },
            { name: 'All Games', value: 'all' }
          )),
    new SlashCommandBuilder()
      .setName('check')
      .setDescription('Run automatic scan for new codes from all configured games'),
    new SlashCommandBuilder()
      .setName('scan')
      .setDescription('Scan a specific URL for codes')
      .addStringOption(option =>
        option.setName('url')
          .setDescription('The URL to scan for codes')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('game')
          .setDescription('Which game to scan for')
          .setRequired(true)
          .addChoices(
            { name: '99 Nights in the Forest', value: '99nights' },
            { name: 'Grow a Garden', value: 'growagarden' },
            { name: 'Fisch', value: 'fischit' },
            { name: 'Blox Fruits', value: 'bloxfruits' },
            { name: 'Steal a Brainrot', value: 'stealabrainrot' }
          )),
    new SlashCommandBuilder()
      .setName('unsetup')
      .setDescription('Remove code notifications from your server (Server Owner only)'),
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('Show all available commands'),
    new SlashCommandBuilder()
      .setName('audit')
      .setDescription('Audit server members with dangerous permissions (DMs you the results)')
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(CONFIG.DISCORD_TOKEN);

  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
}

// Discord bot ready event
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`\n✅ Discord bot logged in as ${readyClient.user.tag}`);
  console.log(`📡 Connected to ${readyClient.guilds.cache.size} server(s)`);
  console.log(`⏰ Scan interval: every 1 hour\n`);
  
  await registerCommands(readyClient.user.id);
  await checkForNewCodes();
  
  setInterval(checkForNewCodes, CONFIG.SCAN_INTERVAL);
  console.log('⏱️ Periodic scanning activated (every 1 hour)');
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isStringSelectMenu()) return;

  // Handle select menu interactions
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'game_select') {
      const selectedGame = interaction.values[0];
      const game = GAMES[selectedGame];
      const storedCodes = loadStoredCodes();
      const gameCodes = storedCodes[selectedGame] || [];

      if (gameCodes.length === 0) {
        await interaction.update({
          content: `${game.emoji} **${game.name}**\n\n❌ No codes available yet for this game.\nThe bot will automatically scan for codes every hour!`,
          components: []
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${game.emoji} ${game.name} - Codes`)
        .setDescription(`Found **${gameCodes.length}** code${gameCodes.length > 1 ? 's' : ''}`)
        .setFooter({ text: 'Codes are automatically updated every hour' })
        .setTimestamp();

      const codeList = gameCodes.slice(0, 25).map((c, i) => {
        const foundDate = new Date(c.foundAt).toLocaleDateString();
        return `**${i + 1}.** \`${c.code}\` *(Found: ${foundDate})*`;
      }).join('\n');

      embed.addFields({
        name: '📋 Available Codes',
        value: codeList || 'No codes available',
        inline: false
      });

      if (gameCodes.length > 25) {
        embed.addFields({
          name: '⚠️ Note',
          value: `Showing 25 of ${gameCodes.length} codes. More codes available!`,
          inline: false
        });
      }

      await interaction.update({
        content: '',
        embeds: [embed],
        components: []
      });
    }
    return;
  }

  const { commandName } = interaction;

  // /codes - Show game selection menu
  if (commandName === 'codes') {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('game_select')
      .setPlaceholder('🎮 Select a game to view codes')
      .addOptions(
        Object.entries(GAMES).map(([id, game]) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(game.name)
            .setDescription(`View codes for ${game.name}`)
            .setValue(id)
            .setEmoji(game.emoji)
        )
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: '## 🎮 Select a Game\n\nChoose which game\'s codes you want to view:',
      components: [row],
      ephemeral: true
    });
    return;
  }

  // /setup - Configure server with game selection
  if (commandName === 'setup') {
    const guild = interaction.guild;
    
    if (!guild) {
      await interaction.reply('❌ This command can only be used in a server!');
      return;
    }
    
    if (interaction.user.id !== guild.ownerId) {
      await interaction.reply('❌ Only the server owner can use this command!');
      return;
    }
    
    const channel = interaction.options.getChannel('channel');
    const gamesOption = interaction.options.getString('games');
    
    if (!channel.isTextBased()) {
      await interaction.reply('❌ Please select a text channel!');
      return;
    }
    
    const selectedGames = gamesOption === 'all' 
      ? Object.keys(GAMES) 
      : [gamesOption];
    
    const gameNames = selectedGames.map(id => GAMES[id].name).join(', ');
    
    console.log(`\n💭 Server setup requested by ${interaction.user.tag} (${guild.name})`);
    
    try {
      const serverConfigs = loadServerConfigs();
      const existingIndex = serverConfigs.findIndex(s => s.guildId === guild.id);
      
      const config = {
        guildId: guild.id,
        guildName: guild.name,
        channelId: channel.id,
        channelName: channel.name,
        ownerId: guild.ownerId,
        games: selectedGames,
        configuredAt: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        serverConfigs[existingIndex] = config;
        await interaction.reply(`✅ **Configuration Updated!**\n\n` +
          `📡 Server: **${guild.name}**\n` +
          `📢 Channel: ${channel}\n` +
          `🎮 Games: **${gameNames}**\n\n` +
          `New codes will be posted here automatically every hour!`);
      } else {
        serverConfigs.push(config);
        await interaction.reply(`✅ **Setup Complete!**\n\n` +
          `📡 Server: **${guild.name}**\n` +
          `📢 Channel: ${channel}\n` +
          `🎮 Games: **${gameNames}**\n\n` +
          `⏰ Scans run every 1 hour\n` +
          `🔍 You can also use \`/check\` and \`/scan\` commands anytime!`);
      }
      
      saveServerConfigs(serverConfigs);
      console.log(`✅ Configuration saved for server: ${guild.name}`);
    } catch (error) {
      await interaction.reply(`❌ Error setting up notifications: ${error.message}`);
      console.error(`❌ Error setting up server configuration: ${error.message}`);
    }
    return;
  }

  // /check - Automatic scan
  if (commandName === 'check') {
    console.log(`\n🎯 Manual scan triggered by ${interaction.user.tag}`);
    await interaction.reply('🔍 Starting manual code scan for all configured games...');
    await checkForNewCodes();
    await interaction.followUp('✅ Manual scan complete! Check the channel for any new codes found.');
    return;
  }

  // /scan <url> <game> - Scan specific URL
  if (commandName === 'scan') {
    const url = interaction.options.getString('url');
    const gameId = interaction.options.getString('game');
    
    if (!url.startsWith('http')) {
      await interaction.reply({ 
        content: '❌ Please provide a valid URL starting with http:// or https://', 
        ephemeral: true 
      });
      return;
    }
    
    const game = GAMES[gameId];
    console.log(`\n🔗 URL scan requested by ${interaction.user.tag}: ${url} (${game.name})`);
    
    try {
      await interaction.reply({ 
        content: `${game.emoji} **Scanning URL for ${game.name} codes...**\n\n🔗 ${url}\n\n⏳ Please wait...`, 
        ephemeral: true 
      });
      
      const foundCodes = await scrapeUrl(url, gameId);
      
      if (foundCodes.length > 0) {
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle(`${game.emoji} ${game.name} - Scan Results`)
          .setDescription(`Found **${foundCodes.length}** code${foundCodes.length > 1 ? 's' : ''}!`)
          .addFields({
            name: '📋 Codes Found',
            value: foundCodes.map((c, index) => `**${index + 1}.** \`${c.code}\``).join('\n'),
            inline: false
          })
          .setFooter({ text: 'Codes from: ' + url.substring(0, 100) })
          .setTimestamp();

        await interaction.followUp({ embeds: [embed], ephemeral: true });
        console.log(`✅ Found ${foundCodes.length} code(s) from user-provided URL`);
      } else {
        await interaction.followUp({ 
          content: `${game.emoji} **${game.name}**\n\n📭 No codes found on this URL.\n\n💡 *Tip: Make sure the page contains codes with relevant keywords*`, 
          ephemeral: true 
        });
        console.log('⚠️ No codes found from user-provided URL');
      }
    } catch (error) {
      await interaction.followUp({ 
        content: `❌ **Error scanning URL:**\n\`\`\`${error.message}\`\`\``, 
        ephemeral: true 
      });
      console.error(`❌ Error scanning user-provided URL: ${error.message}`);
    }
    return;
  }

  // /unsetup - Remove server notifications
  if (commandName === 'unsetup') {
    const guild = interaction.guild;
    
    if (!guild) {
      await interaction.reply('❌ This command can only be used in a server!');
      return;
    }
    
    if (interaction.user.id !== guild.ownerId) {
      await interaction.reply('❌ Only the server owner can use this command!');
      return;
    }
    
    console.log(`\n🗑️ Server removal requested by ${interaction.user.tag} (${guild.name})`);
    
    try {
      const serverConfigs = loadServerConfigs();
      const existingIndex = serverConfigs.findIndex(s => s.guildId === guild.id);
      
      if (existingIndex >= 0) {
        serverConfigs.splice(existingIndex, 1);
        saveServerConfigs(serverConfigs);
        
        await interaction.reply(`✅ **Configuration Removed!**\n\n` +
          `📡 Server: **${guild.name}**\n` +
          `🔕 Code notifications have been disabled for this server.\n\n` +
          `*You can set it up again anytime using \`/setup\`*`);
        
        console.log(`✅ Removed configuration for server: ${guild.name}`);
      } else {
        await interaction.reply(`ℹ️ **Not Configured**\n\n` +
          `This server doesn't have code notifications set up.\n\n` +
          `Use \`/setup\` to set up automatic notifications!`);
        
        console.log(`⚠️ Server ${guild.name} was not configured`);
      }
    } catch (error) {
      await interaction.reply(`❌ Error removing notifications: ${error.message}`);
      console.error(`❌ Error removing server configuration: ${error.message}`);
    }
    return;
  }

  // /audit - Audit dangerous permissions
  if (commandName === 'audit') {
    await interaction.reply({ content: '🔍 Scanning all servers for members with dangerous permissions...\nI will DM you the results shortly.', ephemeral: true });
    
    try {
      const dangerousPermissions = [
        'Administrator',
        'ManageGuild',
        'ManageRoles',
        'ManageChannels',
        'KickMembers',
        'BanMembers',
        'ManageWebhooks',
        'ManageGuildExpressions',
        'ViewAuditLog'
      ];
      
      const results = [];
      
      for (const [guildId, guild] of client.guilds.cache) {
        await guild.members.fetch();
        
        const dangerousMembers = [];
        
        for (const [memberId, member] of guild.members.cache) {
          if (member.user.bot) continue;
          
          const memberPermissions = [];
          
          for (const permName of dangerousPermissions) {
            if (member.permissions.has(permName)) {
              memberPermissions.push(permName);
            }
          }
          
          if (memberPermissions.length > 0) {
            dangerousMembers.push({
              tag: member.user.tag,
              id: member.user.id,
              permissions: memberPermissions,
              roles: member.roles.cache.filter(r => r.id !== guild.id).map(r => r.name).join(', ') || 'No roles'
            });
          }
        }
        
        if (dangerousMembers.length > 0) {
          results.push({
            guildName: guild.name,
            guildId: guild.id,
            memberCount: guild.memberCount,
            dangerousMembers
          });
        }
      }
      
      // Send DM to user
      const user = await client.users.fetch(interaction.user.id);
      
      if (results.length === 0) {
        await user.send('✅ **Security Audit Complete**\n\nNo members with dangerous permissions found in any servers.');
      } else {
        await user.send(`🔐 **Security Audit Results**\n\nFound **${results.length}** server(s) with members having dangerous permissions:\n${'═'.repeat(50)}`);
        
        for (const result of results) {
          const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(`🏰 ${result.guildName}`)
            .setDescription(`Server ID: \`${result.guildId}\`\nTotal Members: **${result.memberCount}**\nMembers with Dangerous Permissions: **${result.dangerousMembers.length}**`)
            .setTimestamp();
          
          for (const member of result.dangerousMembers.slice(0, 10)) {
            const permList = member.permissions.map(p => `\`${p}\``).join(', ');
            embed.addFields({
              name: `👤 ${member.tag}`,
              value: `**ID:** \`${member.id}\`\n**Permissions:** ${permList}\n**Roles:** ${member.roles}`,
              inline: false
            });
          }
          
          if (result.dangerousMembers.length > 10) {
            embed.setFooter({ text: `Showing 10 of ${result.dangerousMembers.length} members with dangerous permissions` });
          }
          
          await user.send({ embeds: [embed] });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        await user.send(`${'═'.repeat(50)}\n✅ Audit complete!`);
      }
      
      console.log(`✅ Security audit completed for ${interaction.user.tag}`);
      await interaction.followUp({ content: '✅ Audit complete! Check your DMs for the results.', ephemeral: true });
      
    } catch (error) {
      console.error('❌ Error during audit:', error);
      await interaction.followUp({ content: `❌ Error during audit: ${error.message}`, ephemeral: true });
    }
    return;
  }

  // /help - Show commands
  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🤖 Multi-Game Code Scraper Bot')
      .setDescription('Automatically finds and tracks game codes!')
      .addFields(
        {
          name: '📋 Commands',
          value: 
            `\`/codes\` - **View available codes** (select from menu)\n` +
            `\`/setup\` - Setup auto notifications for your server (owner only)\n` +
            `\`/check\` - Run manual scan for all games\n` +
            `\`/scan <url> <game>\` - Scan specific URL for codes\n` +
            `\`/unsetup\` - Remove auto notifications (owner only)\n` +
            `\`/audit\` - Audit members with dangerous permissions (DMs you)\n` +
            `\`/help\` - Show this help message`,
          inline: false
        },
        {
          name: '🎮 Supported Games',
          value: 
            `${GAMES['99nights'].emoji} 99 Nights in the Forest\n` +
            `${GAMES['growagarden'].emoji} Grow a Garden\n` +
            `${GAMES['fischit'].emoji} Fisch\n` +
            `${GAMES['bloxfruits'].emoji} Blox Fruits\n` +
            `${GAMES['stealabrainrot'].emoji} Steal a Brainrot`,
          inline: false
        },
        {
          name: '⚡ How It Works',
          value: 
            `• **Auto Scan:** Searches web every hour for new codes\n` +
            `• **Private Viewing:** Use \`/codes\` to view codes privately (only you can see)\n` +
            `• **Auto Notifications:** Setup with \`/setup\` to get updates in your channel`,
          inline: false
        }
      )
      .setFooter({ text: 'All code responses are private and only visible to you!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }
});

// Error handling
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Start the bot
console.log('🚀 Starting Discord bot...');

if (!CONFIG.DISCORD_TOKEN) {
  console.error('\n❌ ERROR: DISCORD_TOKEN environment variable is not set!');
  console.log('Please set DISCORD_TOKEN in your Replit Secrets.');
  process.exit(1);
}

client.login(CONFIG.DISCORD_TOKEN).catch(error => {
  console.error('❌ Failed to login to Discord:', error.message);
  process.exit(1);
});
