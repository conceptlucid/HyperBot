# 🤖 HyperBot

Your personal AI that controls any computer from anywhere.

> Think of it like Manus — but open, flexible, and you run it yourself.

## ✨ Why HyperBot?

- 🖥️ **Control Any Computer** — Screen, mouse, keyboard, files, terminal — right from your browser
- ☁️ **Cloud-Powered** — Access your machines from anywhere via web dashboard
- 🔒 **Your Data, Your Servers** — No third-party servers. You own everything.
- 🔗 **Integrations Ready** — Zapier, Gmail, YouTube, and more via MCP
- 🚀 **One-Line Install** — Get running in seconds

## 🚀 Get Started

### Step 1: Install

```bash
curl -sL https://hyperbot.sh | bash
```

### Step 2: Configure

Edit `~/.hyperbot/config.json`:

```json
{
  "cloudUrl": "https://myhyperbot.com",
  "deviceName": "my-computer",
  "apiKey": "your-api-key"
}
```

### Step 3: Run

```bash
~/.hyperbot/start.sh
```

### Step 4: Control

Open **https://myhyperbot.com/dashboard** and start controlling your machine.

## 💬 What Can You Say?

| Example | What It Does |
|---------|-------------|
| `screenshot` | Takes a screenshot |
| `system info` | Shows CPU, memory, disk |
| `ls /home` | Lists files in /home |
| `!pwd` | Runs `pwd` in terminal |
| `read /etc/hostname` | Reads a file |

## 🏗️ The Stack

- **Agent** — Lightweight Node.js process on your machine
- **Cloud** — Next.js web app (deploy to Vercel)
- **Connection** — WebSocket for real-time control

## 🔧 Run Locally

```bash
# Cloud
cd hyperbot-cloud
npm install && npm run dev

# Agent (in another terminal)
cd hyperbot-agent
npm install && npm start
```

## 📜 License

MIT — Go build something cool.
