# 🤖 HyperBot

Your personal AI that controls any computer. Like Manus, but open and flexible.

## ✨ Features

- 🖥️ **Full Computer Control** — Screen, mouse, keyboard, files, terminal
- ☁️ **Cloud Connected** — Control your machines from anywhere
- 📱 **Any Platform** — macOS, Linux, Windows
- 🔗 **MCP Integrations** — Zapier, YouTube, Gmail, and more
- 🔒 **Secure** — API key auth, command whitelisting

## 🚀 Quick Start

### 1. Install the Agent

```bash
# On the machine you want to control:
curl -sL https://hyperbot.sh | bash
```

### 2. Configure

Edit `~/.hyperbot/config.json`:

```json
{
  "cloudUrl": "https://myhyperbot.com",
  "deviceName": "my-computer",
  "apiKey": "your-api-key"
}
```

### 3. Run

```bash
~/.hyperbot/start.sh
```

### 4. Control!

Visit **https://myhyperbot.com/dashboard** to control your machine.

## 📡 Available Commands

| Command | Description |
|---------|-------------|
| `screenshot` | Take a screenshot |
| `system info` | Get CPU, memory, disk info |
| `ls /path` | List files |
| `!command` | Run terminal command |
| `read file` | Read file contents |
| `write file` | Write to a file |

## 🏗️ Architecture

- **hyperbot-agent** — Runs on machines, receives commands via WebSocket
- **hyperbot-cloud** — Next.js web app (dashboard + API)

## 🔧 Development

```bash
# Clone
git clone https://github.com/conceptlucid/HyperBot.git
cd HyperBot

# Run cloud locally
cd hyperbot-cloud
npm install
npm run dev

# Run agent locally
cd ../hyperbot-agent
npm install
npm start
```

## 📜 License

MIT
