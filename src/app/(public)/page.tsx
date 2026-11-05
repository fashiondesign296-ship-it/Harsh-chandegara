import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import Hero, { type HeroData } from '@/components/Hero';
import Reveal from '@/components/Reveal';

export const revalidate = 60;
const FALLBACK: HeroData = { title: 'ARSHU', subtitle: 'Fashion Portfolio', tagline: 'Tradition in Every Thread, Modernity in Every Design.',
  videoUrl: '', posterUrl: '', mobilePosterUrl: '', ctaLabel: 'Explore Collections', ctaHref: '/collections' };

export default async function Home() {
  const [hero, collections] = await Promise.all([
    db.siteSetting.findUnique({ where: { key: 'hero' } }).catch(() => null),
    db.collection.findMany({ where: { status: 'PUBLISHED' }, orderBy: { sortOrder: 'asc' }, take: 4 }).catch(() => []),
  ]);
  const media = await db.media.findMany({ where: { id: { in: collections.map(c => c.coverMediaId).filter(Boolean) as string[] } } }).catch(() => []);
  const url = (id: string | null) => media.find(m => m.id === id);
  return (
    <main>
      <Hero h={{ ...FALLBACK, ...((hero?.value as object) ?? {}) }} />
      <section className="section px-6 md:px-12">
        <Reveal><h2 className="mx-auto max-w-6xl text-4xl md:text-6xl">Collections</h2></Reveal>
        {collections.length === 0 ? (
          <p className="mx-auto mt-8 max-w-6xl opacity-70">No published collections yet. Add one in the admin dashboard.</p>
        ) : (
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-12">
            {collections.map((c, i) => {
              const m = url(c.coverMediaId);
              return (
                <Reveal key={c.id} className={`hover-zoom ${i % 3 === 0 ? 'md:col-span-7' : 'md:col-span-5'} ${i % 2 ? 'md:mt-16' : ''}`}>
                  <Link href={`/collections/${c.slug}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                      {m && <Image src={m.url} alt={m.alt || c.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />}
                    </div>
                    <h3 className="mt-4 text-2xl">{c.title}</h3>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
