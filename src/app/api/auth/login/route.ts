import { z } from 'zod';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, verifyPassword } from '@/lib/auth';
import { handle, assertSameOrigin } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';

const Body = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local';
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000)) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  const { email, password } = Body.parse(await req.json());
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash)))
    return NextResponse.json({ error: 'Email or password is incorrect' }, { status: 401 });
  await createSession(user);
  await audit(user.id, 'login');
  return NextResponse.json({ ok: true });
});
