import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { handle, assertSameOrigin } from '@/lib/api';
import { audit } from '@/lib/audit';
export const POST = handle(async (req: Request, { params }: { params: { id: string } }) => {
  assertSameOrigin(req);
  const s = await requireRole('EDITOR');
  await db.aiProposal.update({ where: { id: params.id, status: 'PENDING' }, data: { status: 'REJECTED', decidedById: s.uid, decidedAt: new Date() } });
  await audit(s.uid, 'ai.proposal.rejected', 'AiProposal', params.id, {}, 'ai');
  return NextResponse.json({ ok: true });
});
