import { Client, Events, GatewayIntentBits } from 'discord.js';
import { search } from 'duck-duck-scrape';
import { load } from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';

// Configuration from environment variables
const CONFIG = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  GUILD_ID: process.env.GUILD_ID,
  CHANNEL_ID: process.env.CHANNEL_ID,
  USER_ID: process.env.USER_ID,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SCAN_INTERVAL: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
  CODES_FILE: 'codes.json'
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
  return [];
}

// Save codes to file
function saveStoredCodes(codes) {
  try {
    fs.writeFileSync(CONFIG.CODES_FILE, JSON.stringify(codes, null, 2));
    console.log(`💾 Saved ${codes.length} codes to ${CONFIG.CODES_FILE}`);
  } catch (error) {
    console.error('❌ Error saving codes:', error.message);
  }
}

// Extract potential codes from text
function extractCodes(text, url) {
  const codePattern = /([A-Z0-9]{5,15})/g;
  const keywords = ['code', 'reward', 'gift', 'redeem'];
  const potentialCodes = [];
  
  // Split text into words for context checking
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const matches = word.match(codePattern);
    
    if (matches) {
      // Check if nearby words contain keywords
      const contextWords = words.slice(Math.max(0, i - 3), Math.min(words.length, i + 4)).join(' ').toLowerCase();
      const hasKeyword = keywords.some(keyword => contextWords.includes(keyword));
      
      if (hasKeyword) {
        matches.forEach(code => {
          if (!potentialCodes.includes(code)) {
            potentialCodes.push(code);
          }
        });
      }
    }
  }
  
  return potentialCodes.map(code => ({ code, source: url }));
}

// Scrape a URL for codes
async function scrapeUrl(url) {
  try {
    console.log(`🔍 Scraping: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`⚠️ Failed to fetch ${url}: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Remove script and style tags
    $('script, style').remove();
    
    // Get text content
    const text = $('body').text();
    
    return extractCodes(text, url);
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error.message);
    return [];
  }
}

// Fallback: scrape known gaming code websites directly
async function scrapeFallbackUrls() {
  console.log('🔄 Using fallback: scraping known gaming code websites...');
  
  const fallbackUrls = [
    'https://www.pcgamer.com/games/roblox/99-nights-in-forest-codes/',
    'https://beebom.com/99-nights-in-forest-codes/',
    'https://progameguides.com/roblox/99-nights-in-forest-codes/',
    'https://gamerant.com/roblox/99-nights-in-forest-codes/',
    'https://www.pockettactics.com/99-nights-in-forest-codes'
  ];
  
  const allCodes = [];
  
  for (const url of fallbackUrls) {
    const codes = await scrapeUrl(url);
    allCodes.push(...codes);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`✅ Fallback scraping extracted ${allCodes.length} potential codes`);
  return allCodes;
}

// Search for codes on the web
async function searchForCodes() {
  console.log('\n🔎 Starting web search for "99 Nights in Forest codes"...');
  
  try {
    // Add delay before search to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const searchResults = await search('99 Nights in Forest codes', {
      safeSearch: 0
    });
    
    if (!searchResults.results || searchResults.results.length === 0) {
      console.log('⚠️ No search results found, trying fallback URLs...');
      return await scrapeFallbackUrls();
    }
    
    console.log(`📋 Found ${searchResults.results.length} search results`);
    
    // Take top 5 results
    const topResults = searchResults.results.slice(0, 5);
    const allCodes = [];
    
    for (const result of topResults) {
      if (result.url) {
        const codes = await scrapeUrl(result.url);
        allCodes.push(...codes);
        
        // Add delay between requests to be polite
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ Extracted ${allCodes.length} potential codes from ${topResults.length} URLs`);
    return allCodes;
  } catch (error) {
    console.error('❌ Search error:', error.message);
    if (error.message.includes('anomaly') || error.message.includes('too quickly')) {
      console.log('💡 DuckDuckGo rate limiting detected, switching to fallback URLs...');
      return await scrapeFallbackUrls();
    }
    return [];
  }
}

// Check for new codes and notify
async function checkForNewCodes() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 STARTING CODE SCAN');
  console.log('='.repeat(60));
  
  const storedCodes = loadStoredCodes();
  const storedCodeStrings = storedCodes.map(c => c.code);
  
  console.log(`📦 Currently stored: ${storedCodeStrings.length} codes`);
  
  const foundCodes = await searchForCodes();
  const newCodes = foundCodes.filter(found => !storedCodeStrings.includes(found.code));
  
  if (newCodes.length > 0) {
    console.log(`\n🎉 FOUND ${newCodes.length} NEW CODE(S)!`);
    newCodes.forEach(({ code, source }) => {
      console.log(`   ✨ ${code} (from ${source})`);
    });
    
    // Add to stored codes
    const updatedCodes = [...storedCodes, ...newCodes.map(c => ({
      code: c.code,
      source: c.source,
      foundAt: new Date().toISOString()
    }))];
    saveStoredCodes(updatedCodes);
    
    // Send notifications
    await sendNotifications(newCodes);
  } else {
    console.log('\n📭 No new codes found (all are duplicates or none found)');
    if (foundCodes.length > 0) {
      console.log(`   ♻️ Found ${foundCodes.length} code(s) but all were already stored`);
    }
  }
  
  console.log('='.repeat(60));
  console.log('✅ SCAN COMPLETE');
  console.log('='.repeat(60) + '\n');
}

// Send notifications to Discord
async function sendNotifications(newCodes) {
  if (!CONFIG.CHANNEL_ID || !CONFIG.USER_ID) {
    console.log('⚠️ CHANNEL_ID or USER_ID not configured, skipping notifications');
    return;
  }
  
  try {
    // Prepare message
    const codeList = newCodes.map(c => `**${c.code}** - ${c.source}`).join('\n');
    const message = `🎮 **New 99 Nights in Forest Codes Found!**\n\n${codeList}\n\n*Found at: ${new Date().toLocaleString()}*`;
    
    // Send to channel
    try {
      const channel = await client.channels.fetch(CONFIG.CHANNEL_ID);
      if (channel && channel.isTextBased()) {
        await channel.send(message);
        console.log('✅ Posted new codes to channel');
      }
    } catch (error) {
      console.error('❌ Error posting to channel:', error.message);
    }
    
    // Send DM to user
    try {
      const user = await client.users.fetch(CONFIG.USER_ID);
      if (user) {
        await user.send(message);
        console.log('✅ Sent DM to user');
      }
    } catch (error) {
      console.error('❌ Error sending DM:', error.message);
    }
  } catch (error) {
    console.error('❌ Error in notifications:', error.message);
  }
}

// Discord bot ready event
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`\n✅ Discord bot logged in as ${readyClient.user.tag}`);
  console.log(`📡 Connected to ${readyClient.guilds.cache.size} server(s)`);
  console.log(`⏰ Scan interval: every 3 hours\n`);
  
  // Run initial scan
  await checkForNewCodes();
  
  // Set up periodic scanning
  setInterval(checkForNewCodes, CONFIG.SCAN_INTERVAL);
  console.log('⏱️ Periodic scanning activated (every 3 hours)');
});

// Handle !check command
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  if (message.content.trim() === '!check') {
    console.log(`\n🎯 Manual scan triggered by ${message.author.tag}`);
    await message.reply('🔍 Starting manual code scan...');
    await checkForNewCodes();
    await message.reply('✅ Manual scan complete! Check console for details.');
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
  console.log('Please set the following environment variables:');
  console.log('  - DISCORD_TOKEN (required)');
  console.log('  - GUILD_ID (optional, for server context)');
  console.log('  - CHANNEL_ID (required for channel notifications)');
  console.log('  - USER_ID (required for DM notifications)\n');
  process.exit(1);
}

client.login(CONFIG.DISCORD_TOKEN).catch(error => {
  console.error('❌ Failed to login to Discord:', error.message);
  process.exit(1);
});
