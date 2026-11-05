import { z } from 'zod';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole, HttpError } from '@/lib/auth';
import { handle, assertSameOrigin } from '@/lib/api';
import { ACTIONS, type ActionType } from '@/lib/ai/actions';
import { audit } from '@/lib/audit';

const Body = z.object({ confirmDestructive: z.boolean().optional() });

export const POST = handle(async (req: Request, { params }: { params: { id: string } }) => {
  assertSameOrigin(req);
  const s = await requireRole('OWNER');                 // only the owner can approve AI actions
  const { confirmDestructive } = Body.parse(await req.json().catch(() => ({})));
  const prop = await db.aiProposal.findUniqueOrThrow({ where: { id: params.id } });
  if (prop.status !== 'PENDING') throw new HttpError(409, 'Proposal already decided');
  if (prop.destructive && !confirmDestructive) throw new HttpError(400, 'This is a destructive action and needs a second confirmation');

  const def = ACTIONS[prop.actionType as ActionType] as any;
  if (!def) throw new HttpError(400, 'Unknown action');
  const payload = def.schema.parse(prop.payload);      // re-validate at execution time
  const before = await def.snapshot(payload);
  try {
    const result = await def.execute(payload);
    await db.aiProposal.update({ where: { id: prop.id }, data: {
      status: 'EXECUTED', before: before as any, result: result as any, decidedById: s.uid, decidedAt: new Date() } });
    await audit(s.uid, 'ai.proposal.executed', 'AiProposal', prop.id, { actionType: prop.actionType }, 'ai');
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    await db.aiProposal.update({ where: { id: prop.id }, data: { status: 'FAILED', before: before as any } });
    throw e;
  }
});
