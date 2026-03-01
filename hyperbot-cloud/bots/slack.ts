import { App, SlackEvent, say } from '@slack/bolt'

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET

if (!SLACK_TOKEN || !SLACK_SIGNING_SECRET) {
  console.log('⚠️ Slack not configured')
  process.exit(0)
}

const app = new App({
  token: SLACK_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET
})

console.log('🚀 HyperBot Slack ready!')

app.message(async ({ message, say }) => {
  const slackMessage = message as SlackEvent
  
  if (slackMessage.subtype === 'bot_message') return
  
  const { chat } = await import('../server/ai.js')
  
  try {
    const result = await chat([{ role: 'user', content: slackMessage.text || '' }])
    await say(result.response)
  } catch (error: any) {
    await say(`Error: ${error.message}`)
  }
})

;(async () => {
  await app.start(3000)
  console.log('Slack app running on port 3000')
})()
