'use client';
import { useEffect, useState } from 'react';
type T = Record<string, string | number>;
const COLOURS: [string, string][] = [['bg', 'Background'], ['surface', 'Surface'], ['text', 'Body text'], ['heading', 'Headings'], ['primary', 'Primary'],
  ['secondary', 'Secondary'], ['accent', 'Accent'], ['border', 'Borders'], ['navBg', 'Navigation background'], ['navText', 'Navigation text'], ['buttonBg', 'Button'], ['buttonText', 'Button text']];
const J = { 'Content-Type': 'application/json' };

export default function ThemeEditor() {
  const [t, setT] = useState<T | null>(null); const [msg, setMsg] = useState('');
  useEffect(() => { fetch('/api/admin/theme').then(r => r.json()).then(setT); }, []);
  if (!t) return <p>Loading…</p>;
  const set = (k: string, v: string | number) => setT({ ...t, [k]: v });
  const save = async () => { const r = await fetch('/api/admin/theme', { method: 'PUT', headers: J, body: JSON.stringify(t) }); setMsg(r.ok ? 'Published' : 'Check that every colour is a 6-digit HEX'); };
  const reset = async () => { setT(await (await fetch('/api/admin/theme', { method: 'DELETE' })).json()); setMsg('Reset to default'); };
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="text-4xl">Theme</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {COLOURS.map(([k, l]) => (
            <label key={k} className="flex items-center gap-3 text-sm">
              <input type="color" value={t[k] as string} onChange={e => set(k, e.target.value)} aria-label={l} className="h-10 w-10 border-0 bg-transparent" />
              <span className="flex-1">{l}</span>
              <input value={t[k] as string} onChange={e => set(k, e.target.value)} maxLength={7} className="w-24 border-b border-line bg-transparent py-1 text-right" />
            </label>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <label>Heading font<select value={t.fontDisplay as string} onChange={e => set('fontDisplay', e.target.value)} className="mt-1 w-full bg-surface p-2">{['Cormorant Garamond', 'Playfair Display', 'Bodoni Moda'].map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Body font<select value={t.fontBody as string} onChange={e => set('fontBody', e.target.value)} className="mt-1 w-full bg-surface p-2">{['Jost', 'Inter', 'DM Sans'].map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Base font size ({t.baseSize}px)<input type="range" min={14} max={20} value={t.baseSize as number} onChange={e => set('baseSize', +e.target.value)} className="w-full" /></label>
          <label>Section spacing ({t.sectionSpacing}px)<input type="range" min={32} max={200} value={t.sectionSpacing as number} onChange={e => set('sectionSpacing', +e.target.value)} className="w-full" /></label>
          <label>Corner radius ({t.radius}px)<input type="range" min={0} max={24} value={t.radius as number} onChange={e => set('radius', +e.target.value)} className="w-full" /></label>
          <label>Hover effect<select value={t.hover as string} onChange={e => set('hover', e.target.value)} className="mt-1 w-full bg-surface p-2">{['none', 'zoom', 'lift', 'fade'].map(x => <option key={x}>{x}</option>)}</select></label>
        </div>
        <div className="mt-8 flex items-center gap-4"><button className="btn" onClick={save}>Publish theme</button><button onClick={reset} className="text-sm opacity-70">Reset to default</button><span role="status" className="text-sm">{msg}</span></div>
      </div>
      <div aria-label="Live preview" className="h-fit p-10" style={{ background: t.bg as string, color: t.text as string, border: `${t.borderWidth}px solid ${t.border}`, fontSize: `${t.baseSize}px` }}>
        <p style={{ color: t.heading as string, fontFamily: `'${t.fontDisplay}', serif`, fontSize: 48, lineHeight: 1.1 }}>Timeless Elegance</p>
        <p style={{ fontFamily: `'${t.fontBody}', sans-serif`, marginTop: 12 }}>Indo-Western fashion, redefined.</p>
        <button style={{ background: t.buttonBg as string, color: t.buttonText as string, borderRadius: t.radius as number, padding: '12px 24px', marginTop: 24 }}>Explore Collection</button>
        <div className="mt-6 flex gap-2">{['primary', 'secondary', 'accent'].map(k => <span key={k} style={{ background: t[k] as string }} className="h-8 w-8" />)}</div>
      </div>
    </div>
  );
}
