export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Config {
  baseUrl: string;
  authToken: string;
  model: string;
  systemPrompt: string;
}

export interface Chat {
  id: string;
  title: string;
  projectId: string | null;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function deriveChatTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New Chat';
  const text = first.content.trim().replace(/\s+/g, ' ');
  return text.length > 40 ? text.slice(0, 40) + '…' : text;
}

export const DEFAULT_MODELS = [
  { id: 'bedrock-claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (Bedrock)' },
  { id: 'bedrock-claude-haiku-4-5', label: 'Claude Haiku 4.5 (Bedrock)' },
  { id: 'bedrock-claude-opus-4-8', label: 'Claude Opus 4.8 (Bedrock)' },
  { id: 'bedrock/qwen.qwen3-coder-next', label: 'Bedrock Qwen3 Coder Next' },
];

export const DEFAULT_CONFIG: Config = {
  baseUrl: process.env.REACT_APP_LITELLM_BASE_URL || '',
  authToken: process.env.REACT_APP_LITELLM_AUTH_TOKEN || '',
  model: process.env.REACT_APP_LITELLM_DEFAULT_MODEL || 'bedrock-claude-sonnet-4-6',
  systemPrompt: 'You are a helpful assistant. Be concise and accurate.',
};
