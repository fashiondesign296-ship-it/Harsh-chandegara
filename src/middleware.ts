import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// First gate only (fast, edge). Real authorization happens server-side via requireRole().
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') || pathname.startsWith('/api/ai');
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get('arshu_session')?.value;
  let ok = false;
  if (token && process.env.SESSION_SECRET) {
    try { await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET)); ok = true; } catch {}
  }
  if (ok) return NextResponse.next();
  if (isAdminApi) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  return NextResponse.redirect(new URL('/admin/login', req.url));
}
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/api/ai/:path*'] };
