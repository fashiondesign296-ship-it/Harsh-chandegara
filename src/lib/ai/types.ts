export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export interface AiProvider {
  name: string;
  isConfigured(): boolean;
  chat(messages: ChatMessage[], opts?: { json?: boolean }): Promise<string>;
}
