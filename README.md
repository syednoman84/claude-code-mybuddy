# MyBuddy

A ChatGPT-style chat interface that connects to any [LiteLLM](https://github.com/BerriAI/litellm) proxy. Switch models, organise conversations into projects, and keep full chat history — all stored locally in your browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (Create React App, TypeScript) |
| Styling | Plain CSS with CSS custom properties |
| Markdown rendering | `react-markdown` + `remark-gfm` + `remark-breaks` |
| Icons | `lucide-react` |
| State persistence | Browser `localStorage` |
| LLM backend | Any LiteLLM proxy (OpenAI-compatible `/v1/chat/completions`) |

---

## Getting Started

### 1. Install dependencies

```bash
cd app
npm install
```

### 2. Configure your LiteLLM proxy

Copy the example env file and fill in your details:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
REACT_APP_LITELLM_BASE_URL=https://your-litellm-proxy.example.com
REACT_APP_LITELLM_AUTH_TOKEN=sk-your-proxy-key-here
REACT_APP_LITELLM_DEFAULT_MODEL=bedrock-claude-sonnet-4-6
```

> `.env.local` is gitignored — your credentials will never be committed.

### 3. Run the app

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
```

Outputs a static bundle to the `build/` folder, ready to serve with any static file host.

---

## Features

### Chat

- **Streaming responses** — tokens stream in real time as the model generates them
- **Stop generation** — cancel an in-flight response at any time with the Stop button
- **Markdown rendering** — responses render with full GFM support: headings, lists, tables, blockquotes, inline code, and fenced code blocks
- **Code blocks** — syntax-highlighted with a one-click copy button
- **Keyboard shortcuts** — `Enter` sends, `Shift+Enter` adds a newline
- **Auto-growing input** — the textarea expands as you type, up to 240px

### Chat History

- All conversations are **persisted to `localStorage`** and survive page refresh
- **Chat titles** are auto-generated from the first message you send
- **Rename** any chat: double-click its title in the sidebar or right-click → Rename
- **Delete** any chat: hover to reveal the trash icon, or right-click → Delete

### Projects

Projects let you group related chats into named folders, the same way ChatGPT organises conversations.

- **Create a project** — click "New Project" at the bottom of the Projects section in the sidebar and type a name
- **Create a chat inside a project** — hover over the project name and click the `+` button that appears
- **Move a chat into a project** — right-click any chat → Move to "Project Name"
- **Remove a chat from a project** — right-click the chat → Remove from project (moves it to the general Chats section)
- **Rename a project** — right-click the project header → Rename, or double-click the name
- **Delete a project** — right-click → Delete (also deletes all chats inside it)
- Projects are collapsible — click the chevron to expand or collapse

### Model Selection

Switch models without leaving the chat using the dropdown in the header.

**Built-in model options:**

| Display Name | Model ID |
|---|---|
| Claude Sonnet 4.6 (Bedrock) | `bedrock-claude-sonnet-4-6` |
| Claude Haiku 4.5 (Bedrock) | `bedrock-claude-haiku-4-5` |
| Claude Opus 4.8 (Bedrock) | `bedrock-claude-opus-4-8` |
| Bedrock Qwen3 Coder Next | `bedrock/qwen.qwen3-coder-next` |

To use a different model, open **Settings** (gear icon) and either pick from the list or select "Custom model ID" to enter any model string your LiteLLM proxy supports.

### Settings

Click the gear icon (top right) to update at any time:

| Setting | Description |
|---|---|
| LiteLLM Proxy URL | Base URL of your LiteLLM proxy |
| Auth Token | Bearer token / proxy key |
| Model | Active model ID |
| System Prompt | Instructions prepended to every conversation |

Settings are saved to `localStorage` immediately and override the `.env.local` defaults.

### Sidebar

- **Collapsible** — click the panel icon to fold the sidebar to icon-only width; preference persists across reloads
- **New Chat button** — the `+` icon at the top of the sidebar starts a new unassigned chat
- Sidebar sections: **Projects** (grouped chats) → **Chats** (ungrouped)

---

## Configuring LiteLLM Models

### Option 1 — Environment variables (default on first load)

Set these in `.env.local` before starting the app. They are baked in at build time:

```env
REACT_APP_LITELLM_BASE_URL=https://llm.example.com
REACT_APP_LITELLM_AUTH_TOKEN=sk-your-key
REACT_APP_LITELLM_DEFAULT_MODEL=bedrock-claude-sonnet-4-6
```

### Option 2 — Settings modal (runtime, persisted)

Click the gear icon and update any field. Changes take effect immediately and are saved to `localStorage`, overriding the env-var defaults for all future sessions on that browser.

### Option 3 — Custom model IDs

In the Settings modal, choose **Custom model ID** from the model dropdown and enter any model string your proxy exposes, for example:

```
gpt-4o
gemini/gemini-1.5-pro
anthropic/claude-opus-4-8
bedrock/meta.llama3-70b-instruct-v1:0
```

The value is passed directly as the `model` field in the `/v1/chat/completions` request body, so any model your LiteLLM proxy is configured to route will work.

---

## Project Structure

```
app/
├── public/
├── src/
│   ├── api.ts            # Streaming fetch against LiteLLM /v1/chat/completions
│   ├── App.tsx           # Root component — layout, state wiring, send logic
│   ├── App.css           # All styles (CSS custom properties, light theme)
│   ├── CodeBlock.tsx     # Fenced code block with copy button
│   ├── MessageBubble.tsx # Per-message renderer (markdown for assistant, plain for user)
│   ├── Sidebar.tsx       # Sidebar with projects, chat list, context menus
│   ├── SettingsModal.tsx # Config editor modal
│   ├── types.ts          # Shared TypeScript types + utility functions
│   ├── useChats.ts       # Chat & project state hook (localStorage persistence)
│   └── useConfig.ts      # LiteLLM config hook (localStorage persistence)
├── .env.example          # Safe template — commit this
├── .env.local            # Your real credentials — gitignored
└── tsconfig.json
```

---

## Security Notes

- `.env.local` is listed in `.gitignore` by Create React App and will not be committed
- The auth token is stored in `localStorage` after the first settings save — do not use this app on a shared browser profile
- All LLM requests are made directly from the browser to your LiteLLM proxy; no server component is involved
