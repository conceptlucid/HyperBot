import { Client, LocalAuth, Message } from 'whatsapp-web.js'

const QR_CODE = process.env.QR_CODE === 'true'

if (!QR_CODE) {
  console.log('⚠️ WhatsApp not configured (set QR_CODE=true to enable)')
  process.exit(0)
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '.whatsapp-session' }),
  puppeteer: { headless: true }
})

client.on('qr', (qr) => {
  console.log('📱 WhatsApp QR Code:', qr)
})

client.on('ready', () => {
  console.log('🚀 HyperBot WhatsApp ready!')
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
