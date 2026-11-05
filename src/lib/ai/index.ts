import { gemini } from './providers/gemini';
import { groq } from './providers/groq';
import { ollama } from './providers/ollama';
import type { AiProvider } from './types';

// Only free / local providers exist here. There is deliberately NO automatic fallback:
// if the selected provider fails, the error is shown instead of silently switching.
const providers: Record<string, AiProvider> = { gemini, groq, ollama };
export function getProvider(): AiProvider {
  const p = providers[process.env.AI_PROVIDER || 'gemini'];
  if (!p) throw new Error('AI_PROVIDER must be gemini, groq or ollama');
  if (!p.isConfigured()) throw new Error(`AI provider "${p.name}" is not configured. Add its key to .env`);
  return p;
}
