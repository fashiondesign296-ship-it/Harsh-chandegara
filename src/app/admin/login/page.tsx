'use client';
import { useState } from 'react';
export default function Login() {
  const [err, setErr] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
    if (r.ok) location.href = '/admin'; else setErr((await r.json()).error);
  }
  const f = 'w-full border-b border-line bg-transparent py-3 outline-none focus:border-accent';
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-6">
        <h1 className="text-5xl">ARSHU</h1><p className="opacity-70">Sign in to the studio dashboard</p>
        <label className="block">Email<input name="email" type="email" required autoComplete="username" className={f} /></label>
        <label className="block">Password<input name="password" type="password" required autoComplete="current-password" className={f} /></label>
        {err && <p role="alert" className="text-secondary">{err}</p>}
        <button className="btn w-full justify-center">Sign in</button>
      </form>
    </main>
  );
}
