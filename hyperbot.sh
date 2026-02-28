#!/bin/bash
# HyperBot Installer
# Run: curl -sL https://raw.githubusercontent.com/conceptlucid/hyperbot/main/hyperbot.sh | bash
# Or:   curl -sL hyperbot.sh | bash  (if running locally)

set -e

echo "🤖 Installing HyperBot..."

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux*)     PLATFORM="linux";;
    Darwin*)    PLATFORM="darwin";;
    MINGW*|MSYS*|CYGWIN*) PLATFORM="windows";;
    *)          echo "❌ Unsupported OS: $OS"; exit 1;;
esac

ARCH="$(uname -m)"
case "$ARCH" in
    x86_64)     ARCH="x64";;
    aarch64|arm64) ARCH="arm64";;
    *)          echo "❌ Unsupported architecture: $ARCH"; exit 1;;
esac

echo "   Platform: $PLATFORM ($ARCH)"

# Create install dir
INSTALL_DIR="$HOME/.hyperbot"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Clone or update repo
if [ -d ".git" ]; then
    echo "📦 Updating HyperBot..."
    git pull 2>/dev/null || echo "   (using existing installation)"
else
    echo "📥 Downloading HyperBot..."
    git clone --depth 1 https://github.com/conceptlucid/hyperbot.git . 2>/dev/null || {
        echo "⚠️  Git clone failed, creating minimal setup..."
    }
fi

# Install dependencies
if [ -f "package.json" ]; then
    echo "📚 Installing dependencies..."
    npm install --silent 2>/dev/null || npm install 2>/dev/null || true
fi

# Create config
echo "⚙️  Configuring..."
cat > config.json << EOF
{
  "cloudUrl": "https://myhyperbot.com",
  "deviceName": "${HOSTNAME:-my-computer}",
  "apiKey": ""
}
EOF

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npx tsx src/index.ts
EOF
chmod +x start.sh

# Add to crontab for auto-start
CRON_LINE="@reboot $(pwd)/start.sh"
if ! crontab -l 2>/dev/null | grep -q "hyperbot"; then
    echo "📝 Adding to crontab for auto-start..."
    (crontab -l 2>/dev/null || true; echo "$CRON_LINE") | crontab -
fi

echo ""
echo "✅ HyperBot installed!"
echo ""
echo "Next steps:"
echo "1. Edit ~/.hyperbot/config.json with your cloud URL and API key"
echo "2. Run: ~/.hyperbot/start.sh"
echo ""
echo "📖 Docs: https://github.com/conceptlucid/hyperbot"
