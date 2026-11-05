import type { AiProvider } from '../types';
export const gemini: AiProvider = {
  name: 'gemini',
  isConfigured: () => !!process.env.GEMINI_API_KEY,
  async chat(messages, opts) {
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const system = messages.find(m => m.role === 'system')?.content;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents: messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: opts?.json ? { responseMimeType: 'application/json' } : undefined,
      }),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status} (free-tier limit may be reached)`);
    const j = await res.json();
    return j.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '';
  },
};
