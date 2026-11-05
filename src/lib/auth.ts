import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from './db';
import type { Role } from '@prisma/client';

const COOKIE = 'arshu_session';
const key = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET missing or too short');
  return new TextEncoder().encode(s);
};

export type Session = { uid: string; role: Role; email: string };

export async function createSession(user: { id: string; role: Role; email: string }) {
  const token = await new SignJWT({ role: user.role, email: user.email })
    .setProtectedHeader({ alg: 'HS256' }).setSubject(user.id)
    .setIssuedAt().setExpirationTime('8h').sign(key());
  cookies().set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', path: '/', maxAge: 60 * 60 * 8,
  });
}
export function destroySession() { cookies().delete(COOKIE); }

export async function getSession(): Promise<Session | null> {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    return { uid: payload.sub as string, role: payload.role as Role, email: payload.email as string };
  } catch { return null; }
}

const RANK: Record<Role, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };
/** Server-side authorization. Call at the top of every admin route / server action. */
export async function requireRole(min: Role = 'EDITOR'): Promise<Session> {
  const s = await getSession();
  if (!s) throw new HttpError(401, 'Not signed in');
  // Re-check against DB so revoked users lose access immediately.
  const u = await db.user.findUnique({ where: { id: s.uid }, select: { role: true } });
  if (!u || RANK[u.role] < RANK[min]) throw new HttpError(403, 'Not allowed');
  return { ...s, role: u.role };
}

export class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);
