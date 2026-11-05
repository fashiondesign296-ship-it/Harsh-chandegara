import { z } from 'zod';
import { db } from '../db';
import { ThemeSchema } from '../theme';

/**
 * The ONLY things the AI can ever change. Each action has a strict schema, a preview,
 * a `snapshot` (for rollback) and an `execute`. Nothing here runs until a person approves
 * the proposal through /api/ai/proposals/[id]/approve.
 */
type Def<S extends z.ZodTypeAny> = {
  schema: S; destructive?: boolean; label: string;
  snapshot(p: z.infer<S>): Promise<unknown>;
  execute(p: z.infer<S>): Promise<unknown>;
  restore?(snap: any): Promise<void>;
};
const def = <S extends z.ZodTypeAny>(d: Def<S>) => d;

const collectionText = z.object({
  collectionId: z.string(),
  field: z.enum(['description', 'inspiration', 'designConcept', 'fabricDetails', 'philosophy', 'seoTitle', 'seoDescription']),
  value: z.string().max(5000),
});

export const ACTIONS = {
  updateCollectionText: def({
    label: 'Edit collection text', schema: collectionText,
    snapshot: async p => (await db.collection.findUnique({ where: { id: p.collectionId } }))?.[p.field] ?? null,
    execute: p => db.collection.update({ where: { id: p.collectionId }, data: { [p.field]: p.value } }),
    restore: async () => {},
  }),
  createCollectionDraft: def({
    label: 'Create collection draft',
    schema: z.object({ title: z.string().min(1).max(120), description: z.string().max(5000).default(''),
      inspiration: z.string().max(5000).default(''), designConcept: z.string().max(5000).default('') }),
    snapshot: async () => null,
    execute: p => db.collection.create({ data: {
      ...p, status: 'DRAFT',
      slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36) } }),
  }),
  updateTheme: def({
    label: 'Change theme colours / type', schema: ThemeSchema.partial(),
    snapshot: async () => (await db.themeSetting.findUnique({ where: { id: 'active' } }))?.published ?? null,
    async execute(p) {
      const cur: any = (await db.themeSetting.findUnique({ where: { id: 'active' } }))?.published ?? {};
      const next = { ...cur, ...p };
      return db.themeSetting.upsert({ where: { id: 'active' }, update: { published: next }, create: { id: 'active', published: next } });
    },
    restore: async snap => { if (snap) await db.themeSetting.update({ where: { id: 'active' }, data: { published: snap } }); },
  }),
  updateSiteText: def({
    label: 'Edit homepage text', schema: z.object({ field: z.enum(['title', 'subtitle', 'tagline', 'ctaLabel']), value: z.string().max(300) }),
    snapshot: async () => (await db.siteSetting.findUnique({ where: { key: 'hero' } }))?.value ?? null,
    async execute(p) {
      const cur: any = (await db.siteSetting.findUnique({ where: { key: 'hero' } }))?.value ?? {};
      const value = { ...cur, [p.field]: p.value };
      return db.siteSetting.upsert({ where: { key: 'hero' }, update: { value }, create: { key: 'hero', value } });
    },
    restore: async snap => { if (snap) await db.siteSetting.update({ where: { key: 'hero' }, data: { value: snap } }); },
  }),
  archiveCollection: def({
    label: 'Archive collection (destructive)', destructive: true, schema: z.object({ collectionId: z.string() }),
    snapshot: async p => (await db.collection.findUnique({ where: { id: p.collectionId } }))?.status ?? null,
    execute: p => db.collection.update({ where: { id: p.collectionId }, data: { status: 'ARCHIVED' } }),
    restore: async () => {},
  }),
} as const;
export type ActionType = keyof typeof ACTIONS;
export const ACTION_NAMES = Object.keys(ACTIONS) as ActionType[];
