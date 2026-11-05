'use client';
export default function LogoutButton() {
  return <button className="text-sm opacity-70 hover:opacity-100" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/admin/login'; }}>Log out</button>;
}
