import TelegramBot from 'node-telegram-bot-api'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN

if (!TOKEN) {
  console.log('⚠️ Telegram not configured')
  process.exit(0)
}

const bot = new TelegramBot(TOKEN, { polling: true })

console.log('🚀 HyperBot Telegram ready!')

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  if (!msg.text || msg.text.startsWith('/')) return

  const { chat } = await import('../server/ai.js')
  
  try {
    bot.sendChatAction(chatId, 'typing')
    const result = await chat([{ role: 'user', content: msg.text }])
    
    const chunks = result.response.match(/.{1,4000}/g) || []
    for (const chunk of chunks) {
      await bot.sendMessage(chatId, chunk)
    }
  } catch (error: any) {
    bot.sendMessage(chatId, `Error: ${error.message}`)
  }
})
