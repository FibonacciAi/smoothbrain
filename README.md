# smoothbrain

Multi-agent AI chat for your desktop. Four frontier models talking to each other (and you) in one window.

**Claude + Codex + Gemini + Grok** — all running in parallel, reacting to each other, building on each other's ideas.

## What it does

You type a message. Your selected agents all respond simultaneously. They see each other's responses and naturally riff, debate, and build on the conversation. Upload files and they all analyze them together. Toggle agents on/off mid-conversation. Let them run autonomously. Give them specializations. Export the whole thing as markdown when you're done.

## Quick start

```bash
git clone https://github.com/FibonacciAi/smoothbrain.git
cd smoothbrain
npm install
npm start
```

**First run:** Open Settings (Cmd+,) > Keys tab and enter your API keys:

| Agent | Get your key |
|-------|-------------|
| Claude | [console.anthropic.com](https://console.anthropic.com/) |
| Codex/GPT | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Grok | [console.x.ai](https://console.x.ai/) |

You only need keys for the agents you want to use. Keys auto-save to localStorage on input — never sent anywhere except the respective API.

## Agents

| Agent | Provider | Default Model | Icon |
|-------|----------|---------------|------|
| Claude | Anthropic | claude-opus-4-6 | ✦ |
| Codex | OpenAI | gpt-5.4 | ⬢ |
| Gemini | Google | gemini-3.1-pro-preview | ✶ |
| Grok | xAI | grok-4-1-fast-reasoning | ◉ |

Toggle agents on/off with the pills at the bottom of the chat. Only active agents respond — deselected agents are completely invisible, even if other agents @mention them.

## Features

### Multi-agent chat
- All active agents respond in parallel to every message
- Agents see the full conversation including each other's responses
- Natural group dynamics — they agree, disagree, build on each other, call each other out

### File upload & multi-agent review
Drop files into the chat or click `+ file` — every active agent receives the full file contents and reacts to them simultaneously. This is one of the most useful features: instead of getting one AI's opinion, you get four independent takes at once. They read each other's analysis and build on it, catch things the others missed, disagree on approach.

Works with code, text, markdown, JSON, logs, configs — anything text-based. Use it for:
- **Code review** — four different perspectives on your PR, architecture, or bug
- **Document analysis** — legal, technical, research docs analyzed from multiple angles
- **Debugging** — paste a stack trace and let them argue about the root cause
- **Writing feedback** — drop in a draft and get editorial notes from four different voices

### Export chat
Save any conversation as a clean markdown file. Click the download button in the header or hit **Cmd+E**. Output includes all messages with agent names, models used, and timestamps.

### Auto-research mode
Click **AUTO** to let agents discuss autonomously without your input. They take turns advancing the topic for up to 50 rounds. Interject anytime to steer. Pause/resume with Cmd+.

### Model selection
Switch any agent's model in Settings > Models. 25+ models available:

| Provider | Models |
|----------|--------|
| Claude | opus-4-6, sonnet-4-6, haiku-4-5, opus-4, sonnet-4 |
| OpenAI | gpt-5.4, gpt-5.3-chat, gpt-5.3-codex, gpt-5.2, gpt-5, gpt-5-mini, gpt-5-nano, gpt-4.1, o4-mini |
| Gemini | gemini-3.1-pro, gemini-3.1-flash-lite, gemini-3-flash, gemini-2.5-pro, gemini-2.5-flash |
| Grok | grok-4-1-fast-reasoning, grok-4-1-fast-non-reasoning, grok-code-fast-1, grok-4, grok-3 |

### Skills
Activate specializations in Settings > Skills. These inject expert knowledge into all agents' system prompts. Multiple skills can be active at once.

| Skill | Focus |
|-------|-------|
| HTML/CSS | Glassmorphism, animations, responsive design |
| Full-Stack | Frontend, backend, databases, DevOps |
| Math | Proofs, derivations, computation |
| Physics | First principles, dimensional analysis |
| Research | Multi-angle analysis, citations, knowledge gaps |
| Debate | Devil's advocate, stress-tests ideas |
| Security | Threat modeling, pen testing, OWASP |
| Data/ML | Statistical modeling, deep learning, MLOps |
| SB Dev | Meta — for developing Smoothbrain itself |

### Memory
Persistent memory that all agents share. Settings > System > Memory.

- **Auto-extract** — Every 5 agent messages, key facts are pulled from the conversation and stored
- **Manual edit** — Full textarea editor, type or modify anything directly
- **Quick add** — One-line input at the bottom for fast additions
- **Import/Export** — Load from `.md` files or download your memory bank
- **Always active** — Injected into every agent's system prompt automatically

### Workspace
When agents write code, they can save files to an in-session workspace. Files appear in a bar above the input — click to preview, download individually, or grab everything with "Download All".

### Phone access
Use Smoothbrain from your phone on the same WiFi:

1. **Cmd+L** (or Chat menu > Phone Access)
2. Green banner shows your LAN URL
3. Open on your phone — mobile-optimized layout

### Custom system prompt
Persistent instructions all agents follow. Settings > System. Use it for things like "always respond in bullet points" or "focus on practical examples".

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| **Cmd+1-4** | Toggle agents on/off |
| **Cmd+K** | New chat |
| **Cmd+E** | Export chat as markdown |
| **Cmd+,** | Settings |
| **Cmd+.** | Pause/resume auto-research |
| **Cmd+L** | Toggle phone access (LAN) |
| **Enter** | Send message |
| **Shift+Enter** | New line |

## Architecture

Single-file app. No build step, no frameworks, no bundler.

```
smoothbrain/
├── smoothbrain.html      # The entire app (HTML + CSS + JS, ~3000 lines)
├── main.js               # Electron shell (window, menus, LAN server)
├── package.json          # Just electron as a dependency
├── Smoothbrain.command   # macOS double-click launcher
├── LICENSE
└── README.md
```

`smoothbrain.html` contains everything — all styling, all logic, all UI. It runs as a pure browser app inside Electron. The Electron wrapper (`main.js`) adds native macOS window chrome, system menus, and a built-in HTTP server for LAN phone access.

All API calls go directly from the browser to providers via `fetch`. No backend, no proxy, no middleware.

## Data storage

Everything stays on your machine:

| Data | Storage | Persists? |
|------|---------|-----------|
| API keys | localStorage | Yes |
| Memory | localStorage | Yes |
| Custom prompt | localStorage | Yes |
| Chat history | in-memory | No (export to save) |
| Workspace files | in-memory | No (download to save) |

No server. No database. No telemetry. No cloud.

## Requirements

- **Node.js** 18+
- At least one API key (use as many or as few agents as you want)
- macOS, Windows, or Linux

## License

MIT
