import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const cols = await db.collection.findMany({ where: { status: 'PUBLISHED' }, include: { outfits: { where: { status: 'PUBLISHED' } } } }).catch(() => []);
  return [
    { url: base }, { url: `${base}/collections` }, { url: `${base}/contact` },
    ...cols.flatMap(c => [{ url: `${base}/collections/${c.slug}`, lastModified: c.updatedAt }, ...c.outfits.map(o => ({ url: `${base}/collections/${c.slug}/${o.slug}`, lastModified: o.updatedAt }))]),
  ];
}
