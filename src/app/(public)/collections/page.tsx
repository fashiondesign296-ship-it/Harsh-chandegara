import Link from 'next/link';
import { db } from '@/lib/db';
export const revalidate = 60;
export const metadata = { title: 'Collections' };
export default async function Collections() {
  const list = await db.collection.findMany({ where: { status: 'PUBLISHED' }, orderBy: { sortOrder: 'asc' } }).catch(() => []);
  return (
    <main className="px-6 pb-24 pt-36 md:px-12">
      <h1 className="mx-auto max-w-6xl text-5xl md:text-7xl">Collections</h1>
      <ul className="mx-auto mt-14 max-w-6xl divide-y divide-line border-y border-line">
        {list.map(c => (
          <li key={c.id}><Link href={`/collections/${c.slug}`} className="flex items-baseline justify-between gap-6 py-8 transition hover:pl-4">
            <span className="font-display text-3xl text-heading md:text-5xl">{c.title}</span>
            <span className="hidden max-w-sm text-sm opacity-70 md:block">{c.description.slice(0, 110)}</span>
          </Link></li>
        ))}
        {list.length === 0 && <li className="py-8 opacity-70">Nothing published yet.</li>}
      </ul>
    </main>
  );
}
