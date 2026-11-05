import { z } from 'zod';
import { db } from './db';

export const ThemeSchema = z.object({
  bg: z.string().regex(/^#[0-9a-fA-F]{6}$/), surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  text: z.string().regex(/^#[0-9a-fA-F]{6}$/), heading: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/), secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/), border: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  navBg: z.string().regex(/^#[0-9a-fA-F]{6}$/), navText: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  buttonBg: z.string().regex(/^#[0-9a-fA-F]{6}$/), buttonText: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontDisplay: z.enum(['Cormorant Garamond', 'Playfair Display', 'Bodoni Moda']),
  fontBody: z.enum(['Jost', 'Inter', 'DM Sans']),
  baseSize: z.number().min(14).max(20), sectionSpacing: z.number().min(32).max(200),
  radius: z.number().min(0).max(24), borderWidth: z.number().min(0).max(4),
  hover: z.enum(['none', 'zoom', 'lift', 'fade']),
});
export type Theme = z.infer<typeof ThemeSchema>;

// Palette taken from the reference: umber, antique gold, dusty rose, ivory.
export const DEFAULT_THEME: Theme = {
  bg: '#1a1210', surface: '#241a16', text: '#e9dccb', heading: '#f4ead9',
  primary: '#c8a37a', secondary: '#b97a6a', accent: '#e8c9a0', border: '#4a372d',
  navBg: '#1a1210', navText: '#e9dccb', buttonBg: '#f4ead9', buttonText: '#1a1210',
  fontDisplay: 'Cormorant Garamond', fontBody: 'Jost',
  baseSize: 16, sectionSpacing: 96, radius: 0, borderWidth: 1, hover: 'zoom',
};

export async function getTheme(): Promise<Theme> {
  try {
    const row = await db.themeSetting.findUnique({ where: { id: 'active' } });
    const parsed = ThemeSchema.safeParse(row?.published);
    return parsed.success ? parsed.data : DEFAULT_THEME;
  } catch { return DEFAULT_THEME; }
}

export function themeToCss(t: Theme): string {
  return `:root{--c-bg:${t.bg};--c-surface:${t.surface};--c-text:${t.text};--c-heading:${t.heading};` +
    `--c-primary:${t.primary};--c-secondary:${t.secondary};--c-accent:${t.accent};--c-border:${t.border};` +
    `--c-nav-bg:${t.navBg};--c-nav-text:${t.navText};--c-btn-bg:${t.buttonBg};--c-btn-text:${t.buttonText};` +
    `--space-section:${t.sectionSpacing}px;--radius:${t.radius}px;--bw:${t.borderWidth}px;--base:${t.baseSize}px;}`;
}
