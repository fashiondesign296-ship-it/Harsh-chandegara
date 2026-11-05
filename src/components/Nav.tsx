import Link from 'next/link';
const links = [['Collections', '/collections'], ['Lookbooks', '/lookbooks'], ['Moodboards', '/moodboards'], ['Projects', '/projects'],
  ['Sketches', '/sketches'], ['Materials', '/materials'], ['About', '/about'], ['Contact', '/contact']];
export default function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 md:px-12" style={{ color: 'var(--c-nav-text)' }}>
      <Link href="/" className="font-display text-3xl tracking-wide" aria-label="ARSHU home">ARSHU</Link>
      <nav aria-label="Main" className="hidden gap-8 text-sm lg:flex">
        {links.map(([l, h]) => <Link key={h} href={h} className="opacity-80 transition hover:opacity-100">{l}</Link>)}
      </nav>
      <details className="lg:hidden">
        <summary className="cursor-pointer list-none text-sm">Menu</summary>
        <nav className="absolute right-6 top-16 flex flex-col gap-3 bg-bg/95 p-6 text-sm backdrop-blur">
          {links.map(([l, h]) => <Link key={h} href={h}>{l}</Link>)}
        </nav>
      </details>
    </header>
  );
}
