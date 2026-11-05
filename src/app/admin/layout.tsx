import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

const nav = [['Dashboard', '/admin'], ['Collections', '/admin/collections'], ['Theme', '/admin/theme'], ['AI Agent', '/admin/ai']];
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  // /admin/login renders inside this layout too; middleware already lets it through.
  if (!s) return <>{children}</>;
  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-line p-5 md:border-b-0 md:border-r">
        <p className="font-display text-3xl text-heading">ARSHU</p>
        <nav className="mt-6 flex gap-4 overflow-x-auto md:flex-col md:gap-2">
          {nav.map(([l, h]) => <Link key={h} href={h} className="whitespace-nowrap py-1 opacity-80 hover:opacity-100">{l}</Link>)}
          <Link href="/" target="_blank" className="py-1 opacity-80">View site</Link>
        </nav>
        <div className="mt-6"><LogoutButton /></div>
      </aside>
      <div className="p-6 md:p-10">{children}</div>
    </div>
  );
}
