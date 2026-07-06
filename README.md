# MyBuddy - My ChatGPT

A ChatGPT-style chat interface that connects to **any OpenAI-compatible API** — your company's LiteLLM proxy, OpenAI directly, Groq, Google Gemini, Mistral, OpenRouter, or a local model server. Switch models, organise conversations into projects, and keep full chat history — all stored locally in your browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (Create React App, TypeScript) |
| Styling | Plain CSS with CSS custom properties |
| Markdown rendering | `react-markdown` + `remark-gfm` + `remark-breaks` |
| Icons | `lucide-react` |
| State persistence | Browser `localStorage` |
| LLM backend | Any provider with an OpenAI-compatible `/v1/chat/completions` endpoint |

---

## Getting Started

### 1. Install dependencies

```bash
cd app
npm install
```

### 2. Configure your AI provider

Copy the example env file and fill in your details:

```bash
cp app/.env.example app/.env.local
```

Edit `app/.env.local`:

```env
REACT_APP_LITELLM_BASE_URL=https://your-provider-url.com
REACT_APP_LITELLM_AUTH_TOKEN=sk-your-api-key-here
REACT_APP_LITELLM_DEFAULT_MODEL=your-model-id
```

> `app/.env.local` is gitignored — your credentials will never be committed.

### 3. Run the app

```bash
cd app
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
cd app
npm run build
```

Outputs a static bundle to `app/build/`, ready to serve with any static file host.

---

## Supported AI Providers

The app works with **any API that speaks the OpenAI `/v1/chat/completions` format**. Just point it at the right base URL and provide your API key.

### Company LiteLLM Proxy

If your organisation runs a LiteLLM proxy (e.g. to route to AWS Bedrock, Azure, or other backends):

| Setting | Value |
|---|---|
| Base URL | Your proxy URL, e.g. `https://llm.company.com` |
| Auth Token | Your proxy key |
| Model | Whatever your proxy exposes, e.g. `bedrock-claude-sonnet-4-6` |

### OpenAI

Requires an [OpenAI Platform](https://platform.openai.com) account (separate from a ChatGPT subscription).

| Setting | Value |
|---|---|
| Base URL | `https://api.openai.com` |
| Auth Token | Your OpenAI API key (`sk-...`) |
| Model | `gpt-4o`, `gpt-4o-mini`, `o1-mini`, etc. |

### Free Providers (no credit card required)

#### Groq — recommended for free testing
Fast inference, generous free tier, no credit card needed.

| Setting | Value |
|---|---|
| Base URL | `https://api.groq.com/openai` |
| Auth Token | Free key from [console.groq.com](https://console.groq.com) |
| Model | `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, `gemma2-9b-it` |

#### Google Gemini
Free tier via Google AI Studio, no credit card needed.

| Setting | Value |
|---|---|
| Base URL | `https://generativelanguage.googleapis.com/v1beta/openai` |
| Auth Token | Free key from [aistudio.google.com](https://aistudio.google.com) |
| Model | `gemini-2.0-flash`, `gemini-1.5-flash` |

#### OpenRouter — many free models
Aggregator that routes to many providers; several models are permanently free.

| Setting | Value |
|---|---|
| Base URL | `https://openrouter.ai/api` |
| Auth Token | Free key from [openrouter.ai](https://openrouter.ai) |
| Model | `meta-llama/llama-3.1-8b-instruct:free`, `mistralai/mistral-7b-instruct:free` |

#### Mistral
Free tier available, no credit card for basic models.

| Setting | Value |
|---|---|
| Base URL | `https://api.mistral.ai` |
| Auth Token | Free key from [console.mistral.ai](https://console.mistral.ai) |
| Model | `mistral-small-latest`, `open-mistral-7b` |

### Local Models (Ollama)

Run models fully offline with [Ollama](https://ollama.com).

| Setting | Value |
|---|---|
| Base URL | `http://localhost:11434` |
| Auth Token | *(leave blank or enter any value)* |
| Model | `llama3.2`, `mistral`, `qwen2.5-coder`, etc. |

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

**Built-in model options (configurable for any provider):**

| Display Name | Model ID |
|---|---|
| Claude Sonnet 4.6 (Bedrock) | `bedrock-claude-sonnet-4-6` |
| Claude Haiku 4.5 (Bedrock) | `bedrock-claude-haiku-4-5` |
| Claude Opus 4.8 (Bedrock) | `bedrock-claude-opus-4-8` |
| Bedrock Qwen3 Coder Next | `bedrock/qwen.qwen3-coder-next` |

To use a model from a different provider, open **Settings** (gear icon) → select "Custom model ID" and enter any model string your chosen provider supports.

### Settings

Click the gear icon (top right) to update at any time:

| Setting | Description |
|---|---|
| LiteLLM Proxy URL | Base URL of your AI provider |
| Auth Token | API key or bearer token |
| Model | Active model ID |
| System Prompt | Instructions prepended to every conversation |

Settings are saved to `localStorage` immediately and override the `.env.local` defaults.

### Sidebar

- **Collapsible** — click the panel icon to fold the sidebar to icon-only width; preference persists across reloads
- **New Chat button** — the `+` icon at the top starts a new unassigned chat
- Sidebar sections: **Projects** (grouped chats) → **Chats** (ungrouped)

---

## Configuration

### Option 1 — Environment variables (default on first load)

Set these in `app/.env.local` before starting the app. They are baked in at build time and used as defaults until overridden via Settings:

```env
REACT_APP_LITELLM_BASE_URL=https://api.groq.com/openai
REACT_APP_LITELLM_AUTH_TOKEN=sk-your-key
REACT_APP_LITELLM_DEFAULT_MODEL=llama-3.3-70b-versatile
```

### Option 2 — Settings modal (runtime, persisted)

Click the gear icon and update any field. Changes take effect immediately and are saved to `localStorage`, overriding the env-var defaults for all future sessions on that browser.

### Option 3 — Custom model IDs

In the Settings modal, choose **Custom model ID** from the model dropdown and enter any model string your provider exposes:

```
# OpenAI
gpt-4o

# Groq
llama-3.3-70b-versatile

# Google Gemini
gemini-2.0-flash

# OpenRouter (note the :free suffix for free models)
meta-llama/llama-3.1-8b-instruct:free

# Ollama local
llama3.2
```

---

## Project Structure

```
app/
├── public/
├── src/
│   ├── api.ts            # Streaming fetch against /v1/chat/completions
│   ├── App.tsx           # Root component — layout, state wiring, send logic
│   ├── App.css           # All styles (CSS custom properties, light theme)
│   ├── CodeBlock.tsx     # Fenced code block with copy button
│   ├── MessageBubble.tsx # Per-message renderer (markdown for assistant, plain for user)
│   ├── Sidebar.tsx       # Sidebar with projects, chat list, context menus
│   ├── SettingsModal.tsx # Config editor modal
│   ├── types.ts          # Shared TypeScript types + utility functions
│   ├── useChats.ts       # Chat & project state hook (localStorage persistence)
│   └── useConfig.ts      # Provider config hook (localStorage persistence)
├── .env.example          # Safe template — commit this
├── .env.local            # Your real credentials — gitignored
└── tsconfig.json
```

---

## Security Notes

- `app/.env.local` is gitignored and will never be committed
- The auth token is stored in `localStorage` after the first settings save — do not use this app on a shared browser profile
- All LLM requests are made directly from the browser to the provider API; no server component is involved
- Be aware of CORS: some providers (e.g. OpenRouter, Groq, Gemini) allow browser-to-API requests; others may not — check your provider's documentation if you see CORS errors
