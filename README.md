# smoothbrain

Multi-agent AI chat for your desktop. Four frontier models talking to each other (and you) in one window.

**Claude + Codex + Gemini + Grok** — all running in parallel, reacting to each other, building on each other's ideas.

## What it does

You type a message. Your selected agents all respond simultaneously. They see each other's responses and naturally riff, debate, and build on the conversation. Toggle agents on/off mid-conversation. Let them run autonomously. Give them specializations.

## Quick start

```bash
# Clone and run
git clone https://github.com/FibonacciAi/smoothbrain.git
cd smoothbrain
npm install
npm start
```

Or double-click `Smoothbrain.command` on macOS.

**First run:** Open Settings (Cmd+,) > Keys tab and enter your API keys:
- **Claude:** [anthropic.com/settings](https://console.anthropic.com/)
- **Codex/GPT:** [platform.openai.com](https://platform.openai.com/api-keys)
- **Gemini:** [aistudio.google.com](https://aistudio.google.com/apikey)
- **Grok:** [console.x.ai](https://console.x.ai/)

Keys are stored in your browser's localStorage only — never sent anywhere except the respective API.

## Agents

| Agent | Provider | Default Model | Icon |
|-------|----------|---------------|------|
| Claude | Anthropic | claude-opus-4-6 | ✦ |
| Codex | OpenAI | gpt-5.4 | ⬢ |
| Gemini | Google | gemini-3.1-pro-preview | ✶ |
| Grok | xAI | grok-4-1-fast-reasoning | ◉ |

Each agent has its own personality. Toggle them on/off with the pills at the bottom of the chat. Only active agents respond — deselected agents are completely invisible, even if other agents @mention them.

## Features

### Multi-agent chat
- All active agents respond in parallel to every message
- Agents see the full conversation history including each other's responses
- Natural group conversation dynamics — they agree, disagree, riff, and build

### Auto-research mode
- Click AUTO to let agents discuss autonomously without your input
- They take turns advancing the topic for up to 50 rounds
- Interject anytime to steer the conversation
- Pause/resume with Cmd+.

### Model selection
Switch any agent's model in Settings > Models. 25+ models available:

**Claude:** opus-4-6, sonnet-4-6, haiku-4-5, opus-4, sonnet-4
**OpenAI:** gpt-5.4, gpt-5.3-chat, gpt-5.3-codex, gpt-5.2, gpt-5, gpt-5-mini, gpt-5-nano, gpt-4.1, o4-mini
**Gemini:** gemini-3.1-pro, gemini-3.1-flash-lite, gemini-3-flash, gemini-2.5-pro, gemini-2.5-flash
**Grok:** grok-4-1-fast-reasoning, grok-4-1-fast-non-reasoning, grok-code-fast-1, grok-4, grok-3

### Skills
Activate specializations in Settings > Skills to focus agent responses:

| Skill | What it does |
|-------|-------------|
| HTML/CSS | Web design expert — glassmorphism, animations, responsive |
| Full-Stack | Frontend + backend + databases + DevOps |
| Math | Proofs, derivations, computational approaches |
| Physics | First principles, dimensional analysis, experiments |
| Research | Multi-angle analysis, citations, knowledge gaps |
| Debate | Devil's advocate, stress-tests ideas |
| Security | Threat modeling, pen testing, OWASP |
| Data/ML | Statistical modeling, deep learning, MLOps |
| SB Dev | Meta-skill for developing Smoothbrain itself |

Multiple skills can be active simultaneously.

### Memory
Persistent memory that survives across sessions. Settings > System > Memory.

- **Auto-extract:** Every 5 agent messages, key facts are automatically extracted and stored
- **Manual edit:** Full textarea editor — type, edit, delete freely
- **Quick add:** One-line input for fast additions
- **Import/Export:** Load from or save to `.md` files
- All agents see your stored memories via their system prompt

### Workspace
When agents generate code, they can save files to an in-session workspace:
- Files appear in the workspace bar above the input
- Click to preview, download individually, or "Download All" as a combined export

### Phone access (LAN)
Access Smoothbrain from your phone on the same WiFi network:
1. Chat menu > Phone Access (Cmd+L)
2. Green banner appears with your local URL (e.g. `http://192.168.1.x:3777`)
3. Open that URL on your phone
4. Mobile-optimized UI with responsive layout and safe area support

### File upload
Upload files for agents to analyze — click the `+ file` button or drag into the chat. File contents are included in the conversation context.

### Custom system prompt
Add persistent instructions that all agents follow. Settings > System > Custom System Prompt.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+1-4 | Toggle agents |
| Cmd+K | New chat |
| Cmd+, | Settings |
| Cmd+. | Pause/resume auto-research |
| Cmd+L | Toggle phone access (LAN) |
| Enter | Send message |
| Shift+Enter | New line |

## Architecture

Single-file app — everything lives in `smoothbrain.html` (~3000 lines):
- All CSS, JS, and HTML in one file
- No build step, no frameworks, no bundler
- Native `fetch` for all API calls
- `localStorage` for keys, memory, and settings

```
smoothbrain/
├── smoothbrain.html      # The entire app
├── main.js               # Electron wrapper (window, menus, LAN server)
├── package.json          # Dependencies (just electron)
├── Smoothbrain.command   # macOS double-click launcher
└── README.md
```

The Electron wrapper (`main.js`) provides:
- Native macOS window with hidden titlebar
- System menus (Chat, Edit, View, Window)
- LAN HTTP server for phone access
- No Node.js integration in the renderer — pure browser environment

## Requirements

- **Node.js** 18+ (for Electron)
- **API keys** for whichever agents you want to use (at least one)
- Works on macOS, Windows, and Linux (Electron)

## Data storage

Everything is local:
- **API keys** → localStorage (`smoothbrain-api-keys`)
- **Memory** → localStorage (`smoothbrain-memory`)
- **Custom prompt** → localStorage (`smoothbrain-custom-prompt`)
- **Workspace files** → in-memory (download to save)
- **No server, no database, no cloud** — all API calls go directly from your browser to the providers

## License

MIT
