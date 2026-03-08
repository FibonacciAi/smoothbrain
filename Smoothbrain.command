#!/bin/bash
cd "$(dirname "$0")"
clear

echo ""
echo "  ╔═══════════════════════════════════════╗"
echo "  ║     SMOOTHBRAIN RESEARCH HUB          ║"
echo "  ║     Multi-Agent AI Chat               ║"
echo "  ╚═══════════════════════════════════════╝"
echo ""

# Check for Node.js
if ! command -v node &>/dev/null; then
  echo "  [!] Node.js not found."
  if command -v brew &>/dev/null; then
    echo "  [*] Installing via Homebrew..."
    brew install node
  else
    echo "  [!] Please install Node.js from https://nodejs.org"
    echo ""
    read -p "  Press Enter to exit..."
    exit 1
  fi
fi

echo "  [*] Node $(node -v) detected"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "  [*] Installing dependencies (first run)..."
  npm install --no-fund --no-audit 2>&1 | tail -1
  echo ""
fi

echo "  [*] Launching Smoothbrain..."
echo ""

npx electron . 2>/dev/null

# If electron fails, try direct path
if [ $? -ne 0 ]; then
  ./node_modules/.bin/electron . 2>/dev/null
fi
