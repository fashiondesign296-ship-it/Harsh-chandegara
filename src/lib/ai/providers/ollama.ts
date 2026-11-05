import type { AiProvider } from '../types';
export const ollama: AiProvider = {
  name: 'ollama',
  isConfigured: () => !!process.env.OLLAMA_URL,
  async chat(messages, opts) {
    const res = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OLLAMA_MODEL || 'llama3.1', messages, stream: false, format: opts?.json ? 'json' : undefined }),
    });
    if (!res.ok) throw new Error('Ollama is not reachable. Start it locally with `ollama serve`.');
    return (await res.json()).message?.content ?? '';
  },
};
