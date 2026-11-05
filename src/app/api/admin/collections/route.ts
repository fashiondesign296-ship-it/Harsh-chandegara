import { z } from 'zod';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { handle, assertSameOrigin } from '@/lib/api';
import { audit } from '@/lib/audit';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const Create = z.object({ title: z.string().trim().min(1).max(120), description: z.string().max(5000).default('') });
const Patch = z.object({
  id: z.string(), title: z.string().trim().min(1).max(120).optional(), description: z.string().max(5000).optional(),
  inspiration: z.string().max(5000).optional(), designConcept: z.string().max(5000).optional(),
  fabricDetails: z.string().max(5000).optional(), philosophy: z.string().max(5000).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const GET = handle(async () => { await requireRole('VIEWER'); return NextResponse.json(await db.collection.findMany({ orderBy: { updatedAt: 'desc' } })); });

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req); const s = await requireRole('EDITOR');
  const d = Create.parse(await req.json());
  const c = await db.collection.create({ data: { ...d, slug: `${slugify(d.title)}-${Date.now().toString(36)}` } });
  await audit(s.uid, 'collection.create', 'Collection', c.id); return NextResponse.json(c, { status: 201 });
});

export const PATCH = handle(async (req: Request) => {
  assertSameOrigin(req); const s = await requireRole('EDITOR');
  const { id, ...data } = Patch.parse(await req.json());
  const c = await db.collection.update({ where: { id }, data });
  await audit(s.uid, 'collection.update', 'Collection', id, data); revalidatePath('/', 'layout'); return NextResponse.json(c);
});

export const DELETE = handle(async (req: Request) => {
  assertSameOrigin(req); const s = await requireRole('OWNER');
  const { id } = z.object({ id: z.string() }).parse(await req.json());
  await db.collection.delete({ where: { id } }); await audit(s.uid, 'collection.delete', 'Collection', id);
  revalidatePath('/', 'layout'); return NextResponse.json({ ok: true });
});
