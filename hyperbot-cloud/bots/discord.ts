import { Client, GatewayIntentBits, Events, Channel, Guild } from 'discord.js'
import { chat, getConfig } from './ai.js'

// Discord bot for HyperBot
const TOKEN = process.env.DISCORD_BOT_TOKEN

if (!TOKEN) {
  console.log('⚠️  Discord not configured. Set DISCORD_BOT_TOKEN')
  process.exit(0)
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID
const ALLOWED_SERVERS = process.env.DISCORD_ALLOWED_SERVERS?.split(',') || []

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🤖 HyperBot Discord bot ready! Logged in as ${readyClient.user.tag}`)
})

client.on(Events.MessageCreate, async (message) => {
  // Ignore bots
  if (message.author.bot) return

  // Check if in allowed server (if configured)
  if (ALLOWED_SERVERS.length > 0) {
    if (!ALLOWED_SERVERS.includes(message.guildId || '')) {
      return // Not in allowed server
    }
  }

  // Check if in allowed channel
  if (CHANNEL_ID && message.channelId !== CHANNEL_ID) {
    return
  }

  try {
    const config = getConfig()
    if (!config.hasOpenRouter && !config.hasOpenAI && !config.hasAnthropic) {
      await message.reply('⚠️ AI not configured. Tell the owner to set up the API key!')
      return
    }

    // Send "thinking" reaction
    await message.react('🤔')

    const result = await chat([
      { role: 'user', content: message.content }
    ])

    // Remove thinking, add check
    await message.reactions.removeAll()
    await message.react('✅')

    // Handle long responses
    if (result.response.length > 2000) {
      await message.reply(result.response.slice(0, 2000))
      await message.reply(result.response.slice(2000))
    } else {
      await message.reply(result.response)
    }
  } catch (error: any) {
    console.error('Discord error:', error)
    await message.reply(`❌ Error: ${error.message}`)
  }
})

client.login(TOKEN)

console.log('🚀 HyperBot Discord bot starting...')
