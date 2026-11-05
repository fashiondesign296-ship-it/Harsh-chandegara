# ARSHU – Indo-Western Fashion Portfolio

Next.js 14 (App Router) · TypeScript · Tailwind · PostgreSQL (Prisma) · S3-compatible media · GSAP · modular free-tier AI.

## Quick start
```bash
cp .env.example .env        # fill in values (never commit .env)
npm install
npx prisma db push
npm run db:seed             # creates the first OWNER from SEED_ADMIN_*; then delete those vars
npm run dev                 # http://localhost:3000  ·  admin: /admin
```

## Status (honest)
| Area | State |
|---|---|
| Schema (all tables in the brief) | Done |
| Auth: bcrypt, JWT cookie, middleware + server-side role checks, rate limit, same-origin CSRF | Done, untested |
| Public: home, collections, collection detail, outfit detail (own URL), contact, sitemap, robots | Done, untested |
| Admin: dashboard, collections CRUD, theme editor (live preview, HEX, reset, publish) | Done, untested |
| Media upload (type/size/magic-byte validation, S3/R2) | API done; no UI picker yet |
| AI agent: providers (Gemini/Groq/Ollama), memory in prompt, proposal → approve/reject → execute, audit | Done, untested |
| AI rollback | Snapshots stored; `restore` only implemented for theme + homepage text |
| CRUD for outfits, projects, moodboards, sketches, materials | **Not built yet** (schema ready) |
| Public pages: lookbooks, moodboards, projects, sketches, materials, about | **Not built yet** |
| Drag-and-drop visual editor, undo/redo, device previews | **Not built yet** (`PageLayout` table ready) |
| AI memory review/edit UI, image analysis, conversation history UI | **Not built yet** |
| Password reset, role management UI | **Not built yet** |

## Hosting recommendation
Vercel (native Next.js, ISR, image optimisation) + Neon Postgres (free) + Cloudflare R2 (free tier) . Netlify also works but Next 14 features lag behind. Nothing is purchased automatically.

## AI
Free providers only: Google AI Studio (Gemini), Groq, or local Ollama. No automatic fallback. The AI can only propose actions from `src/lib/ai/actions.ts`; the OWNER must approve; destructive actions need a second confirmation.
