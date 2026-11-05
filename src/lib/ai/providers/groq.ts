import type { AiProvider } from '../types';
export const groq: AiProvider = {
  name: 'groq',
  isConfigured: () => !!process.env.GROQ_API_KEY,
  async chat(messages, opts) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant', messages,
        response_format: opts?.json ? { type: 'json_object' } : undefined,
      }),
    });
    if (!res.ok) throw new Error(`Groq error ${res.status} (free-tier limit may be reached)`);
    return (await res.json()).choices?.[0]?.message?.content ?? '';
  },
};
