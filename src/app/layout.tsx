import type { Metadata } from 'next';
import { Cormorant_Garamond, Playfair_Display, Bodoni_Moda, Jost, Inter, DM_Sans } from 'next/font/google';
import { getTheme, themeToCss } from '@/lib/theme';
import './globals.css';

const f = {
  'Cormorant Garamond': Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--f1' }),
  'Playfair Display': Playfair_Display({ subsets: ['latin'], variable: '--f2' }),
  'Bodoni Moda': Bodoni_Moda({ subsets: ['latin'], variable: '--f3' }),
  Jost: Jost({ subsets: ['latin'], variable: '--f4' }),
  Inter: Inter({ subsets: ['latin'], variable: '--f5' }),
  'DM Sans': DM_Sans({ subsets: ['latin'], variable: '--f6' }),
};
const fam = { 'Cormorant Garamond': '--f1', 'Playfair Display': '--f2', 'Bodoni Moda': '--f3', Jost: '--f4', Inter: '--f5', 'DM Sans': '--f6' } as const;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'ARSHU – Indo-Western Fashion Portfolio', template: '%s | ARSHU' },
  description: 'Indo-Western fashion design: contemporary ethnic wear, fusion silhouettes and Indian craft.',
  openGraph: { type: 'website', siteName: 'ARSHU' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getTheme();
  const vars = `${themeToCss(t)}:root{--font-display:var(${fam[t.fontDisplay]});--font-body:var(${fam[t.fontBody]});}`;
  return (
    <html lang="en" className={Object.values(f).map(x => x.variable).join(' ')}>
      <head><style dangerouslySetInnerHTML={{ __html: vars }} /></head>
      <body>{children}</body>
    </html>
  );
}
