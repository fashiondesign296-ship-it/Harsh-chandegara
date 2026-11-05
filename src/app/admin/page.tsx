import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  await requireRole('VIEWER');
  const [collections, outfits, projects, moodboards, sketches, materials, published, drafts, enquiries, activity] = await Promise.all([
    db.collection.count(), db.outfit.count(), db.project.count(), db.moodboard.count(), db.sketch.count(), db.material.count(),
    db.collection.count({ where: { status: 'PUBLISHED' } }), db.collection.count({ where: { status: 'DRAFT' } }),
    db.enquiry.count({ where: { read: false } }),
    db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);
  const stats = [['Collections', collections], ['Outfits', outfits], ['Projects', projects], ['Moodboards', moodboards], ['Sketches', sketches],
    ['Materials', materials], ['Published collections', published], ['Draft collections', drafts], ['New enquiries', enquiries]];
  return (
    <div>
      <h1 className="text-4xl">Dashboard</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map(([l, n]) => (<div key={l as string} className="border border-line bg-surface p-5"><p className="font-display text-4xl text-heading">{n}</p><p className="text-sm opacity-70">{l}</p></div>))}
      </div>
      <h2 className="mt-12 text-2xl">Recent activity</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
        {activity.map(a => (<li key={a.id} className="flex justify-between py-3"><span>{a.action}{a.source === 'ai' ? ' (AI)' : ''}</span><time className="opacity-60">{a.createdAt.toLocaleString()}</time></li>))}
        {activity.length === 0 && <li className="py-3 opacity-70">No activity yet.</li>}
      </ul>
    </div>
  );
}
