import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
export const revalidate = 60;

async function load(slug: string, outfit: string) {
  return db.outfit.findFirst({ where: { slug: outfit, status: 'PUBLISHED', collection: { slug, status: 'PUBLISHED' } },
    include: { collection: true, images: { include: { media: true }, orderBy: { sortOrder: 'asc' } } } }).catch(() => null);
}
export async function generateMetadata({ params }: { params: { slug: string; outfit: string } }) {
  const o = await load(params.slug, params.outfit);
  return o ? { title: o.seoTitle || o.title, description: o.seoDescription || o.description.slice(0, 160) } : {};
}

export default async function OutfitPage({ params }: { params: { slug: string; outfit: string } }) {
  const o = await load(params.slug, params.outfit);
  if (!o) notFound();
  const facts: [string, string][] = [['Silhouette', o.silhouette], ['Fabric', o.fabric], ['Embroidery', o.embroidery], ['Inspiration', o.inspiration]];
  return (
    <main className="px-6 pb-24 pt-32 md:px-12">
      <Link href={`/collections/${o.collection.slug}`} className="text-sm opacity-70">Back to {o.collection.title}</Link>
      <div className="mx-auto mt-8 grid max-w-6xl gap-12 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {o.images.map(i => (
            <figure key={i.id}>
              <div className="relative aspect-[3/4] bg-surface"><Image src={i.media.url} alt={i.media.alt || `${o.title}, ${i.view.toLowerCase()} view`} fill sizes="(min-width:768px) 55vw, 100vw" className="object-cover" /></div>
              <figcaption className="mt-2 text-xs capitalize opacity-60">{i.view.toLowerCase()} view</figcaption>
            </figure>
          ))}
        </div>
        <div className="md:sticky md:top-24 md:self-start">
          <h1 className="text-5xl">{o.title}</h1>
          <p className="mt-6">{o.description}</p>
          <dl className="mt-8 space-y-5">{facts.filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt className="font-display text-xl text-heading">{k}</dt><dd className="opacity-80">{v}</dd></div>))}</dl>
        </div>
      </div>
    </main>
  );
}
