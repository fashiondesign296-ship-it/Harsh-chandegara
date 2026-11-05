'use client';
import { useState } from 'react';
export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState('sending');
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd) });
    if (r.ok) setState('sent'); else { setErr((await r.json()).error ?? 'Could not send'); setState('error'); }
  }
  if (state === 'sent') return <p className="font-display text-3xl text-heading">Thank you. Your message has been sent.</p>;
  const field = 'w-full border-b border-line bg-transparent py-3 outline-none focus:border-accent';
  return (
    <form onSubmit={submit} className="max-w-xl space-y-6">
      <label className="block">Name<input name="name" required maxLength={120} className={field} /></label>
      <label className="block">Email<input name="email" type="email" required className={field} /></label>
      <label className="block">Message<textarea name="message" required minLength={5} maxLength={4000} rows={5} className={field} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state === 'error' && <p role="alert" className="text-secondary">{err}</p>}
      <button className="btn" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</button>
    </form>
  );
}
