'use client';
import { useEffect, useState } from 'react';
type C = { id: string; title: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; slug: string };
const J = { 'Content-Type': 'application/json' };

export default function Collections() {
  const [list, setList] = useState<C[]>([]); const [title, setTitle] = useState(''); const [q, setQ] = useState('');
  const load = async () => setList(await (await fetch('/api/admin/collections')).json());
  useEffect(() => { load(); }, []);
  const patch = async (id: string, status: C['status']) => { await fetch('/api/admin/collections', { method: 'PATCH', headers: J, body: JSON.stringify({ id, status }) }); load(); };
  const del = async (id: string) => { if (confirm('Delete this collection and its outfits? This cannot be undone.')) { await fetch('/api/admin/collections', { method: 'DELETE', headers: J, body: JSON.stringify({ id }) }); load(); } };
  const add = async (e: React.FormEvent) => { e.preventDefault(); await fetch('/api/admin/collections', { method: 'POST', headers: J, body: JSON.stringify({ title }) }); setTitle(''); load(); };
  return (
    <div>
      <h1 className="text-4xl">Collections</h1>
      <form onSubmit={add} className="mt-6 flex gap-3"><input value={title} onChange={e => setTitle(e.target.value)} required placeholder="New collection title" className="flex-1 border-b border-line bg-transparent py-2 outline-none" /><button className="btn">Add collection</button></form>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" className="mt-6 w-full border-b border-line bg-transparent py-2 outline-none" />
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {list.filter(c => c.title.toLowerCase().includes(q.toLowerCase())).map(c => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span><span className="font-display text-2xl text-heading">{c.title}</span> <span className="ml-2 text-xs opacity-60">{c.status.toLowerCase()}</span></span>
            <span className="flex gap-4 text-sm">
              {c.status !== 'PUBLISHED' ? <button onClick={() => patch(c.id, 'PUBLISHED')}>Publish</button> : <button onClick={() => patch(c.id, 'DRAFT')}>Unpublish</button>}
              <button onClick={() => patch(c.id, 'ARCHIVED')}>Archive</button>
              <button onClick={() => del(c.id)} className="text-secondary">Delete</button>
            </span>
          </li>
        ))}
        {list.length === 0 && <li className="py-4 opacity-70">No collections yet. Add your first one above.</li>}
      </ul>
    </div>
  );
}
