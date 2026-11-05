import { z } from 'zod';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, assertSameOrigin } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';

const Body = z.object({
  name: z.string().trim().min(1).max(120), email: z.string().email().max(200),
  message: z.string().trim().min(5).max(4000), website: z.string().max(0).optional(),
});
export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local';
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60_000)) return NextResponse.json({ error: 'Too many messages. Try later.' }, { status: 429 });
  const { website: _h, ...data } = Body.parse(await req.json());
  await db.enquiry.create({ data });
  return NextResponse.json({ ok: true });
});
