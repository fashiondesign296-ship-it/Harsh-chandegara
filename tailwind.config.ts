import type { Config } from 'tailwindcss';
// Colours are CSS variables so the Theme Editor can change them live (see src/lib/theme.ts).
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--c-bg)', surface: 'var(--c-surface)', ink: 'var(--c-text)', heading: 'var(--c-heading)',
        primary: 'var(--c-primary)', secondary: 'var(--c-secondary)', accent: 'var(--c-accent)',
        line: 'var(--c-border)',
      },
      fontFamily: { display: ['var(--font-display)', 'serif'], body: ['var(--font-body)', 'sans-serif'] },
      letterSpacing: { wideish: '0.28em' },
    },
  },
  plugins: [],
} satisfies Config;
