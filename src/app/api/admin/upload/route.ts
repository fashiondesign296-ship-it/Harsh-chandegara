import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { handle, assertSameOrigin } from '@/lib/api';
import { uploadImage } from '@/lib/storage';
import { rateLimit } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req); const s = await requireRole('EDITOR');
  if (!rateLimit(`upload:${s.uid}`, 60, 60_000)) return NextResponse.json({ error: 'Too many uploads' }, { status: 429 });
  const file = (await req.formData()).get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 });
  try {
    const up = await uploadImage(Buffer.from(await file.arrayBuffer()));
    const media = await db.media.create({ data: { key: up.key, url: up.url, mime: up.mime, sizeBytes: up.sizeBytes } });
    await audit(s.uid, 'media.upload', 'Media', media.id);
    return NextResponse.json(media, { status: 201 });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
});
