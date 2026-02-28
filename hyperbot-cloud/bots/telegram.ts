import TelegramBot from 'node-telegram-bot-api'
import { chat, getConfig } from '../server/ai.js'

// Telegram bot for HyperBot
const TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!TOKEN) {
  console.log('⚠️ Telegram not configured. Set TELEGRAM_BOT_TOKEN')
  process.exit(0)
}

const bot = new TelegramBot(TOKEN, { polling: true })

console.log('🚀 HyperBot Telegram bot starting...')

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text

  // Ignore commands
  if (!text || text.startsWith('/')) return

  // Check if from allowed users (if configured)
  const ALLOWED_USERS = process.env.TELEGRAM_ALLOWED_USERS?.split(',') || []
  if (ALLOWED_USERS.length > 0) {
    if (!ALLOWED_USERS.includes(chatId.toString())) {
      bot.sendMessage(chatId, '⛔ You are not authorized to use this bot.')
      return
    }
  }

  try {
    const config = getConfig()
    if (!config.hasOpenRouter && !config.hasOpenAI && !config.hasAnthropic) {
      bot.sendMessage(chatId, '⚠️ AI not configured. Tell the owner to set up the API key!')
      return
    }

    // Send typing action
    bot.sendChatAction(chatId, 'typing')

    const result = await chat([
      { role: 'user', content: text }
    ])

    // Split long messages
    if (result.response.length > 4096) {
      const chunks = result.response.match(/.{1,4000}/g) || []
      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk)
      }
    } else {
      await bot.sendMessage(chatId, result.response)
    }
  } catch (error: any) {
    console.error('Telegram error:', error)
    bot.sendMessage(chatId, `❌ Error: ${error.message}`)
  }
})

console.log('✅ HyperBot Telegram bot ready!')
