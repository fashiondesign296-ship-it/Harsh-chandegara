import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-14 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 md:flex-row">
        <div><p className="font-display text-3xl text-heading">ARSHU</p><p className="mt-2 max-w-xs text-sm opacity-70">Indo-Western fashion design rooted in Indian craft.</p></div>
        <div className="flex gap-10 text-sm"><Link href="/collections">Collections</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs opacity-50">© {new Date().getFullYear()} ARSHU</p>
    </footer>
  );
}
