import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await db.collection.findUnique({ where: { slug: params.slug } }).catch(() => null);
  return c ? { title: c.seoTitle || c.title, description: c.seoDescription || c.description.slice(0, 160) } : {};
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const c = await db.collection.findUnique({ where: { slug: params.slug },
    include: { outfits: { where: { status: 'PUBLISHED' }, orderBy: { sortOrder: 'asc' } } } }).catch(() => null);
  if (!c || c.status !== 'PUBLISHED') notFound();
  const colours = (c.colourStory as { name: string; hex: string }[]) ?? [];
  const blocks: [string, string][] = [['Inspiration', c.inspiration], ['Design concept', c.designConcept], ['Fabric details', c.fabricDetails], ['Design philosophy', c.philosophy]];
  return (
    <main className="px-6 pb-24 pt-36 md:px-12">
      <h1 className="mx-auto max-w-6xl text-5xl md:text-8xl">{c.title}</h1>
      <p className="mt-8 max-w-2xl text-lg md:ml-[16.6%]">{c.description}</p>
      <div className="mx-auto mt-16 grid max-w-6xl gap-10 md:grid-cols-2">
        {blocks.filter(([, v]) => v).map(([k, v]) => (<section key={k}><h2 className="text-2xl">{k}</h2><p className="mt-3 opacity-80">{v}</p></section>))}
      </div>
      {colours.length > 0 && (
        <div className="mx-auto mt-14 flex max-w-6xl gap-4">
          {colours.map(x => (<div key={x.hex} className="text-xs"><div className="h-14 w-14 border border-line" style={{ background: x.hex }} /><span className="mt-1 block">{x.name}</span></div>))}
        </div>
      )}
      <h2 className="mx-auto mt-24 max-w-6xl text-4xl">Outfits</h2>
      <ul className="mx-auto mt-8 grid max-w-6xl gap-6 sm:grid-cols-2 md:grid-cols-3">
        {c.outfits.map(o => (<li key={o.id}><Link href={`/collections/${c.slug}/${o.slug}`} className="block border border-line p-6 transition hover:bg-surface"><span className="font-display text-2xl text-heading">{o.title}</span></Link></li>))}
        {c.outfits.length === 0 && <li className="opacity-70">Outfits coming soon.</li>}
      </ul>
    </main>
  );
}
