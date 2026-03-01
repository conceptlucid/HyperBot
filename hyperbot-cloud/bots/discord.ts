import { Client, GatewayIntentBits, Events } from 'discord.js'

const TOKEN = process.env.DISCORD_BOT_TOKEN

if (!TOKEN) {
  console.log('⚠️ Discord not configured')
  process.exit(0)
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

client.once(Events.ClientReady, () => {
  console.log(`🤖 HyperBot Discord ready: ${client.user?.tag}`)
})

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return
  
  const { chat } = await import('../server/ai.js')
  
  try {
    await message.react('🤔')
    const result = await chat([{ role: 'user', content: message.content }])
    await message.reactions.removeAll()
    await message.react('✅')
    
    const chunks = result.response.match(/.{1,1990}/g) || []
    for (const chunk of chunks) {
      await message.reply(chunk)
    }
  } catch (error: any) {
    await message.reply(`Error: ${error.message}`)
  }
})

client.login(TOKEN)
