import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
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

// Search for codes using Serper.dev Google Search API
async function searchForCodes() {
  console.log('\n🔎 Starting Google Search for "99 Nights in Forest codes" via Serper.dev...');
  
  if (!CONFIG.SERPER_KEY) {
    console.error('❌ SERPER_KEY not configured! Cannot perform search.');
    return [];
  }
  
  try {
    // Call Serper.dev API
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': CONFIG.SERPER_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: '99 Nights in Forest codes',
        num: 10
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
    
    console.log(`📋 Found ${data.organic.length} search results from Google`);
    
    // Take top 5 results
    const topResults = data.organic.slice(0, 5);
    const allCodes = [];
    
    for (const result of topResults) {
      if (result.link) {
        console.log(`   🔗 Scraping: ${result.title}`);
        const codes = await scrapeUrl(result.link);
        allCodes.push(...codes);
        
        // Add delay between requests to be polite
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ Extracted ${allCodes.length} potential codes from ${topResults.length} URLs`);
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
  try {
    // Prepare clean message with codes only
    const codeList = newCodes.map((c, index) => `${index + 1}. \`${c.code}\``).join('\n');
    const message = `🎮 **New 99 Nights in Forest Codes!**\n\n${codeList}\n\n✨ **Total: ${newCodes.length} new code${newCodes.length > 1 ? 's' : ''}**\n⏰ Found at: ${new Date().toLocaleString()}`;
    
    // Send to main channel (if configured)
    if (CONFIG.CHANNEL_ID) {
      try {
        const channel = await client.channels.fetch(CONFIG.CHANNEL_ID);
        if (channel && channel.isTextBased()) {
          await channel.send(message);
          console.log('✅ Posted new codes to main channel');
        }
      } catch (error) {
        console.error('❌ Error posting to main channel:', error.message);
      }
    }
    
    // Send DM to main user (if configured)
    if (CONFIG.USER_ID) {
      try {
        const user = await client.users.fetch(CONFIG.USER_ID);
        if (user) {
          await user.send(message);
          console.log('✅ Sent DM to main user');
        }
      } catch (error) {
        console.error('❌ Error sending DM to main user:', error.message);
      }
    }
    
    // Send to all configured servers
    const serverConfigs = loadServerConfigs();
    if (serverConfigs.length > 0) {
      console.log(`📡 Sending to ${serverConfigs.length} configured server(s)...`);
      for (const config of serverConfigs) {
        try {
          const channel = await client.channels.fetch(config.channelId);
          if (channel && channel.isTextBased()) {
            await channel.send(message);
            console.log(`✅ Posted to server: ${config.guildId} (${config.guildName})`);
          }
        } catch (error) {
          console.error(`❌ Error posting to server ${config.guildId}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in notifications:', error.message);
  }
}

// Register slash commands
async function registerCommands(clientId) {
  const commands = [
    new SlashCommandBuilder()
      .setName('check')
      .setDescription('Run automatic scan for new codes from all sources'),
    new SlashCommandBuilder()
      .setName('scan')
      .setDescription('Scan a specific URL for codes')
      .addStringOption(option =>
        option.setName('url')
          .setDescription('The URL to scan for codes')
          .setRequired(true)),
    new SlashCommandBuilder()
      .setName('thought')
      .setDescription('Setup code notifications for your server (Server Owner only)')
      .addChannelOption(option =>
        option.setName('channel')
          .setDescription('The channel where codes will be posted')
          .setRequired(true)),
    new SlashCommandBuilder()
      .setName('unthought')
      .setDescription('Remove code notifications from your server (Server Owner only)'),
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('Show all available commands')
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
  
  // Register slash commands
  await registerCommands(readyClient.user.id);
  
  // Run initial scan
  await checkForNewCodes();
  
  // Set up periodic scanning
  setInterval(checkForNewCodes, CONFIG.SCAN_INTERVAL);
  console.log('⏱️ Periodic scanning activated (every 1 hour)');
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // /check - Automatic scan
  if (commandName === 'check') {
    console.log(`\n🎯 Manual scan triggered by ${interaction.user.tag}`);
    await interaction.reply('🔍 Starting manual code scan...');
    await checkForNewCodes();
    await interaction.followUp('✅ Manual scan complete! Check the channel for any new codes found.');
    return;
  }

  // /scan <url> - Scan specific URL
  if (commandName === 'scan') {
    const url = interaction.options.getString('url');
    
    if (!url.startsWith('http')) {
      await interaction.reply('❌ Please provide a valid URL starting with http:// or https://');
      return;
    }
    
    console.log(`\n🔗 URL scan requested by ${interaction.user.tag}: ${url}`);
    
    try {
      await interaction.reply(`🔍 Scanning URL for codes...\n${url}`);
      
      const foundCodes = await scrapeUrl(url);
      
      if (foundCodes.length > 0) {
        const codeList = foundCodes.map((c, index) => `${index + 1}. \`${c.code}\``).join('\n');
        const response = `✅ **Found ${foundCodes.length} code${foundCodes.length > 1 ? 's' : ''}!**\n\n${codeList}`;
        await interaction.followUp(response);
        console.log(`✅ Found ${foundCodes.length} code(s) from user-provided URL`);
      } else {
        await interaction.followUp('📭 No codes found on this URL.\n*Tip: Make sure the page contains codes with keywords like "Code", "Reward", or "Gift"*');
        console.log('⚠️ No codes found from user-provided URL');
      }
    } catch (error) {
      await interaction.followUp(`❌ Error scanning URL: ${error.message}`);
      console.error(`❌ Error scanning user-provided URL: ${error.message}`);
    }
    return;
  }

  // /thought - Setup server notifications (Server Owner only)
  if (commandName === 'thought') {
    const guild = interaction.guild;
    
    if (!guild) {
      await interaction.reply('❌ This command can only be used in a server!');
      return;
    }
    
    // Check if user is the server owner
    if (interaction.user.id !== guild.ownerId) {
      await interaction.reply('❌ Only the server owner can use this command!');
      return;
    }
    
    const channel = interaction.options.getChannel('channel');
    
    if (!channel.isTextBased()) {
      await interaction.reply('❌ Please select a text channel!');
      return;
    }
    
    console.log(`\n💭 Server setup requested by ${interaction.user.tag} (${guild.name})`);
    
    try {
      const serverConfigs = loadServerConfigs();
      
      // Check if server is already configured
      const existingIndex = serverConfigs.findIndex(s => s.guildId === guild.id);
      
      if (existingIndex >= 0) {
        // Update existing configuration
        serverConfigs[existingIndex] = {
          guildId: guild.id,
          guildName: guild.name,
          channelId: channel.id,
          channelName: channel.name,
          ownerId: guild.ownerId,
          configuredAt: new Date().toISOString()
        };
        saveServerConfigs(serverConfigs);
        
        await interaction.reply(`✅ **Configuration Updated!**\n\n` +
          `📡 Server: **${guild.name}**\n` +
          `📢 Channel: ${channel}\n` +
          `🎮 New codes will be posted here automatically every hour!\n\n` +
          `*Your previous configuration has been updated.*`);
        
        console.log(`✅ Updated configuration for server: ${guild.name}`);
      } else {
        // Add new configuration
        serverConfigs.push({
          guildId: guild.id,
          guildName: guild.name,
          channelId: channel.id,
          channelName: channel.name,
          ownerId: guild.ownerId,
          configuredAt: new Date().toISOString()
        });
        saveServerConfigs(serverConfigs);
        
        await interaction.reply(`✅ **Setup Complete!**\n\n` +
          `📡 Server: **${guild.name}**\n` +
          `📢 Channel: ${channel}\n` +
          `🎮 New 99 Nights in Forest codes will be posted here automatically!\n\n` +
          `⏰ Scans run every 1 hour\n` +
          `🔍 You can also use \`/check\` and \`/scan\` commands anytime!`);
        
        console.log(`✅ New configuration added for server: ${guild.name}`);
      }
    } catch (error) {
      await interaction.reply(`❌ Error setting up notifications: ${error.message}`);
      console.error(`❌ Error setting up server configuration: ${error.message}`);
    }
    return;
  }

  // /unthought - Remove server notifications (Server Owner only)
  if (commandName === 'unthought') {
    const guild = interaction.guild;
    
    if (!guild) {
      await interaction.reply('❌ This command can only be used in a server!');
      return;
    }
    
    // Check if user is the server owner
    if (interaction.user.id !== guild.ownerId) {
      await interaction.reply('❌ Only the server owner can use this command!');
      return;
    }
    
    console.log(`\n🗑️ Server removal requested by ${interaction.user.tag} (${guild.name})`);
    
    try {
      const serverConfigs = loadServerConfigs();
      const existingIndex = serverConfigs.findIndex(s => s.guildId === guild.id);
      
      if (existingIndex >= 0) {
        // Remove the configuration
        const removedConfig = serverConfigs[existingIndex];
        serverConfigs.splice(existingIndex, 1);
        saveServerConfigs(serverConfigs);
        
        await interaction.reply(`✅ **Configuration Removed!**\n\n` +
          `📡 Server: **${guild.name}**\n` +
          `🔕 Code notifications have been disabled for this server.\n\n` +
          `*You can set it up again anytime using \`/thought\`*`);
        
        console.log(`✅ Removed configuration for server: ${guild.name}`);
      } else {
        await interaction.reply(`ℹ️ **Not Configured**\n\n` +
          `This server doesn't have code notifications set up.\n\n` +
          `Use \`/thought\` to set up automatic notifications!`);
        
        console.log(`⚠️ Server ${guild.name} was not configured`);
      }
    } catch (error) {
      await interaction.reply(`❌ Error removing notifications: ${error.message}`);
      console.error(`❌ Error removing server configuration: ${error.message}`);
    }
    return;
  }

  // /help - Show commands
  if (commandName === 'help') {
    const helpMessage = `🤖 **99 Nights in Forest Bot - Slash Commands**\n\n` +
      `\`/check\` - Run automatic scan for new codes (anyone can use)\n` +
      `\`/scan <url>\` - Scan a specific URL for codes (anyone can use)\n` +
      `\`/thought\` - Setup notifications for your server (server owner only)\n` +
      `\`/unthought\` - Remove notifications from your server (server owner only)\n` +
      `\`/help\` - Show this help message\n\n` +
      `⏰ **Auto Scan:** Every 1 hour\n` +
      `💡 **Examples:** Type \`/\` and select a command from the list!`;
    await interaction.reply(helpMessage);
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
