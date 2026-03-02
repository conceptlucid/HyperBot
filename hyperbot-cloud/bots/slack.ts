// Slack Bot for HyperBot
import { App } from '@slack/bolt'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

app.message(async ({ message, say }) => {
  if ('subtype' in message && message.subtype === 'bot_message') return
  const text = 'text' in message ? message.text : ''
  
  const { chat } = await import('../server/ai.js')
  
  try {
    const result = await chat([{ role: 'user', content: text }])
    await say(result.response)
  } catch (error: any) {
    await say(`Error: ${error.message}`)
  }
})

;(async () => {
  await app.start(3000)
  console.log('✅ Slack bot running on port 3000')
})()
