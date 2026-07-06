import { Config, Message } from './types';

export async function* streamChat(
  messages: Message[],
  config: Config,
  signal: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const payload = {
    model: config.model,
    stream: true,
    messages: [
      ...(config.systemPrompt ? [{ role: 'system', content: config.systemPrompt }] : []),
      ...messages.map(({ role, content }) => ({ role, content })),
    ],
  };

  const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.authToken}`,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed chunks
      }
    }
  }
}
