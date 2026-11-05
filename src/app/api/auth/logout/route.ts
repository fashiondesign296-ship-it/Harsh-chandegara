import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import { handle, assertSameOrigin } from '@/lib/api';
export const POST = handle(async (req: Request) => { assertSameOrigin(req); destroySession(); return NextResponse.json({ ok: true }); });
