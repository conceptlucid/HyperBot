# Running Bots

## Discord Bot

```bash
# Set environment variables
export DISCORD_BOT_TOKEN=your-bot-token
export DISCORD_CHANNEL_ID=your-channel-id
export DISCORD_ALLOWED_SERVERS=server1,server2

# Run
npx tsx bots/discord.ts
```

## Telegram Bot

```bash
# Set environment variables
export TELEGRAM_BOT_TOKEN=your-bot-token
export TELEGRAM_ALLOWED_USERS=user1,user2

# Run
npx tsx bots/telegram.ts
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_BOT_TOKEN` | Your Discord bot token |
| `DISCORD_CHANNEL_ID` | Channel to respond in (optional) |
| `DISCORD_ALLOWED_SERVERS` | Comma-separated server IDs (optional) |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `TELEGRAM_ALLOWED_USERS` | Comma-separated user IDs (optional) |

The bots share the same AI config from the main server.
