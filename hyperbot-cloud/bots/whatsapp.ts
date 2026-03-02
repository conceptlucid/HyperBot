// WhatsApp Bot for HyperBot
import { Client, LocalAuth, Message } from 'whatsapp-web.js'

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '.hyperbot-whatsapp-session' }),
  puppeteer: { headless: true, args: ['--no-sandbox'] }
})

client.on('qr', (qr) => {
  console.log('📱 WhatsApp QR:', qr)
})

client.on('ready', () => {
  console.log('✅ WhatsApp bot ready!')
})

client.on('message', async (message: Message) => {
  if (message.fromMe) return
  
  const { chat } = await import('../server/ai.js')
  
  try {
    const result = await chat([{ role: 'user', content: message.body }])
    await message.reply(result.response)
  } catch (error: any) {
    await message.reply(`Error: ${error.message}`)
  }
})

client.initialize()
