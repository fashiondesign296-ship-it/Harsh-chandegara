import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { handle, assertSameOrigin } from '@/lib/api';
import { ThemeSchema, DEFAULT_THEME, getTheme } from '@/lib/theme';
import { audit } from '@/lib/audit';

export const GET = handle(async () => { await requireRole('VIEWER'); return NextResponse.json(await getTheme()); });
export const PUT = handle(async (req: Request) => {
  assertSameOrigin(req); const s = await requireRole('EDITOR');
  const theme = ThemeSchema.parse(await req.json());
  await db.themeSetting.upsert({ where: { id: 'active' }, update: { published: theme }, create: { id: 'active', published: theme } });
  await audit(s.uid, 'theme.publish'); revalidatePath('/', 'layout'); return NextResponse.json(theme);
});
export const DELETE = handle(async (req: Request) => {   // reset to defaults
  assertSameOrigin(req); const s = await requireRole('EDITOR');
  await db.themeSetting.upsert({ where: { id: 'active' }, update: { published: DEFAULT_THEME }, create: { id: 'active', published: DEFAULT_THEME } });
  await audit(s.uid, 'theme.reset'); revalidatePath('/', 'layout'); return NextResponse.json(DEFAULT_THEME);
});
