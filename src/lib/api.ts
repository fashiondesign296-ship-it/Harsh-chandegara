import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { HttpError } from './auth';

/** Wrap route handlers: consistent errors, no stack traces leaked. */
export function handle<T extends unknown[]>(fn: (...a: T) => Promise<Response>) {
  return async (...a: T) => {
    try { return await fn(...a); }
    catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) return NextResponse.json({ error: 'Invalid input', issues: e.issues }, { status: 400 });
      console.error(e);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  };
}

/** CSRF defence for cookie-authed mutations: same-origin check (plus SameSite=strict cookie). */
export function assertSameOrigin(req: Request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || new URL(origin).host !== host) throw new HttpError(403, 'Bad origin');
}
