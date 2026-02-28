# HyperBot Agent

The agent that runs on machines and receives commands from the cloud.

## Features

- 🖥️ **Screen Capture** - Take screenshots
- 🖱️ **Mouse Control** - Move, click, drag, scroll
- ⌨️ **Keyboard** - Type, hotkeys, press/release
- 💻 **Terminal** - Run shell commands
- 📁 **Files** - Read, write, list, search, move, copy
- ℹ️ **System Info** - CPU, memory, disk, network

## Install

```bash
# Clone and build
git clone https://github.com/conceptlucid/hyperbot.git
cd hyperbot-agent
npm install

# Configure
cp config.example.json config.json
# Edit config.json with your cloud URL and API key

# Run
npm start
```

## Commands

The agent responds to these commands over WebSocket:

```json
{ "type": "command", "tool": "screen.capture" }
{ "type": "command", "tool": "mouse.move", "args": { "x": 100, "y": 200 } }
{ "type": "command", "tool": "mouse.click", "args": { "button": "left" } }
{ "type": "command", "tool": "keyboard.type", "args": { "text": "Hello!" } }
{ "type": "command", "tool": "terminal.run", "args": { "command": "ls -la" } }
{ "type": "command", "tool": "files.read", "args": { "path": "/etc/hostname" } }
{ "type": "command", "tool": "system.info" }
```

## Security

- Requires API key to connect
- Blocks dangerous commands (rm -rf /, etc.)
- Runs in user space (not root)

## License

MIT
