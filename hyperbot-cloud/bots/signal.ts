import { Bot, session, GrammyError, HttpError } from 'grammy'
import { conversations, createConversation } from 'grammy-conversations'

const TOKEN = process.env.SIGNAL_BOT_TOKEN

if (!TOKEN) {
  console.log('⚠️ Signal not configured')
  process.exit(0)
}

const bot = new Bot(TOKEN)

// Simple conversation setup
bot.use(session({ initial: () => ({}) }))

bot.on('message:text', async (ctx) => {
  const { chat } = await import('../server/ai.js')
  
  try {
    const result = await chat([{ role: 'user', content: ctx.message.text }])
    await ctx.reply(result.response)
  } catch (error: any) {
    await ctx.reply(`Error: ${error.message}`)
  }
})

bot.catch((err) => {
  const ctx = err.ctx
  console.error('Error:', err.error)
})

console.log('🚀 HyperBot Signal ready!')

bot.start()
