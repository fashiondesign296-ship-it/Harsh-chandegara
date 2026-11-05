import { z } from 'zod';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { handle, assertSameOrigin } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';
import { getProvider } from '@/lib/ai';
import { systemPrompt } from '@/lib/ai/prompt';
import { ACTIONS, ACTION_NAMES, type ActionType } from '@/lib/ai/actions';
import { audit } from '@/lib/audit';

const Body = z.object({ conversationId: z.string().optional(), message: z.string().min(1).max(4000) });
const Out = z.object({ reply: z.string(), proposal: z.object({
  actionType: z.string(), summary: z.string(), payload: z.record(z.any()) }).nullable().optional() });

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const s = await requireRole('EDITOR');
  if (!rateLimit(`ai:${s.uid}`, 20, 60_000)) return NextResponse.json({ error: 'Slow down: 20 AI requests per minute.' }, { status: 429 });
  const { conversationId, message } = Body.parse(await req.json());

  const convo = conversationId
    ? await db.aiConversation.findFirstOrThrow({ where: { id: conversationId, userId: s.uid } })
    : await db.aiConversation.create({ data: { userId: s.uid, title: message.slice(0, 50) } });
  await db.aiMessage.create({ data: { conversationId: convo.id, role: 'user', content: message } });

  const history = await db.aiMessage.findMany({ where: { conversationId: convo.id }, orderBy: { createdAt: 'asc' }, take: 20 });
  const raw = await getProvider().chat([
    { role: 'system', content: await systemPrompt() },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ], { json: true });

  let parsed;
  try { parsed = Out.parse(JSON.parse(raw)); } catch { parsed = { reply: raw, proposal: null }; }
  await db.aiMessage.create({ data: { conversationId: convo.id, role: 'assistant', content: parsed.reply } });

  let proposal = null;
  const p = parsed.proposal;
  if (p && ACTION_NAMES.includes(p.actionType as ActionType)) {
    const def = ACTIONS[p.actionType as ActionType];
    const check = def.schema.safeParse(p.payload);
    if (check.success) {
      proposal = await db.aiProposal.create({ data: {
        conversationId: convo.id, actionType: p.actionType, payload: check.data as any,
        summary: p.summary, destructive: !!def.destructive } });
      await audit(s.uid, 'ai.proposal.created', 'AiProposal', proposal.id, { actionType: p.actionType }, 'ai');
    }
  }
  return NextResponse.json({ conversationId: convo.id, reply: parsed.reply, proposal });
});
