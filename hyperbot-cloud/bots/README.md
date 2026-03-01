# Bots

Run these alongside the main server to connect HyperBot to different platforms.

## Setup

```bash
npm install
```

## Discord

```bash
export DISCORD_BOT_TOKEN=your-token
npx tsx bots/discord.ts
```

## Telegram

```bash
export TELEGRAM_BOT_TOKEN=your-token
npx tsx bots/telegram.ts
```

## Slack

```bash
export SLACK_BOT_TOKEN=xoxb-...
export SLACK_SIGNING_SECRET=your-secret
npx tsx bots/slack.ts
```

## WhatsApp

```bash
# Requires QR code auth (run locally)
export QR_CODE=true
npx tsx bots/whatsapp.ts
```

## Signal

```bash
export SIGNAL_BOT_TOKEN=your-token
npx tsx bots/signal.ts
```

## Environment Variables

| Channel | Variables |
|---------|-----------|
| Discord | `DISCORD_BOT_TOKEN` |
| Telegram | `TELEGRAM_BOT_TOKEN` |
| Slack | `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET` |
| WhatsApp | `QR_CODE=true` (local only) |
| Signal | `SIGNAL_BOT_TOKEN` |

## Run All

```bash
# Start main server
npm run server &

# Start bots (in separate terminals or background)
npx tsx bots/discord.ts &
npx tsx bots/telegram.ts &
```
