'use client';
import { useRef, useState } from 'react';
type Proposal = { id: string; summary: string; actionType: string; destructive: boolean; payload: unknown; status?: string };
type Msg = { role: 'user' | 'assistant'; text: string; proposal?: Proposal };
const J = { 'Content-Type': 'application/json' };
const SUGGESTED = ['Design a new Indo-Western collection concept', 'Suggest a colour palette for a monsoon collection', 'Improve my homepage tagline', 'Write an SEO description for my newest collection'];

export default function AiWorkspace() {
  const [msgs, setMsgs] = useState<Msg[]>([]); const [cid, setCid] = useState<string>(); const [busy, setBusy] = useState(false); const input = useRef<HTMLInputElement>(null);
  async function send(text: string) {
    if (!text.trim()) return; setBusy(true); setMsgs(m => [...m, { role: 'user', text }]);
    const r = await fetch('/api/ai/chat', { method: 'POST', headers: J, body: JSON.stringify({ conversationId: cid, message: text }) });
    const j = await r.json(); setBusy(false);
    if (!r.ok) return setMsgs(m => [...m, { role: 'assistant', text: j.error ?? 'Something went wrong' }]);
    setCid(j.conversationId); setMsgs(m => [...m, { role: 'assistant', text: j.reply, proposal: j.proposal ?? undefined }]);
  }
  async function decide(i: number, approve: boolean) {
    const p = msgs[i].proposal!; let body = {};
    if (approve && p.destructive) { if (!confirm('This is a destructive change. Approve it?')) return; body = { confirmDestructive: true }; }
    const r = await fetch(`/api/ai/proposals/${p.id}/${approve ? 'approve' : 'reject'}`, { method: 'POST', headers: J, body: JSON.stringify(body) });
    const status = r.ok ? (approve ? 'Applied' : 'Rejected') : `Failed: ${(await r.json()).error}`;
    setMsgs(m => m.map((x, k) => k === i ? { ...x, proposal: { ...x.proposal!, status } } : x));
  }
  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-3xl flex-col">
      <div className="flex items-center justify-between"><h1 className="text-4xl">ARSHU AI Agent</h1><button className="text-sm opacity-70" onClick={() => { setMsgs([]); setCid(undefined); }}>New conversation</button></div>
      <div className="mt-6 flex-1 space-y-5 overflow-y-auto" aria-live="polite">
        {msgs.length === 0 && <div className="flex flex-wrap gap-2">{SUGGESTED.map(s => <button key={s} onClick={() => send(s)} className="border border-line px-4 py-2 text-left text-sm hover:bg-surface">{s}</button>)}</div>}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'ml-auto max-w-[80%] bg-surface p-4' : 'max-w-[90%]'}>
            <p className="whitespace-pre-wrap">{m.text}</p>
            {m.proposal && (
              <div className="mt-3 border border-accent p-4 text-sm">
                <p className="font-display text-xl text-heading">Proposed change</p>
                <p className="mt-1">{m.proposal.summary}</p>
                <pre className="mt-2 max-h-40 overflow-auto bg-surface p-2 text-xs">{JSON.stringify({ action: m.proposal.actionType, ...(m.proposal.payload as object) }, null, 2)}</pre>
                {m.proposal.status ? <p className="mt-2" role="status">{m.proposal.status}</p> : (
                  <div className="mt-3 flex gap-3"><button className="btn" onClick={() => decide(i, true)}>Approve</button><button onClick={() => decide(i, false)}>Reject</button></div>)}
              </div>)}
          </div>))}
        {busy && <p className="opacity-60">Thinking…</p>}
      </div>
      <form className="mt-4 flex gap-3" onSubmit={e => { e.preventDefault(); const v = input.current!.value; input.current!.value = ''; send(v); }}>
        <input ref={input} placeholder="Ask about collections, colours, copy…" className="flex-1 border-b border-line bg-transparent py-3 outline-none" /><button className="btn" disabled={busy}>Send</button>
      </form>
    </div>
  );
}
