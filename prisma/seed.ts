import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_THEME } from '../src/lib/theme';
const db = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL, pw = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !pw || pw.length < 12) throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (12+ chars) in .env');
  await db.user.upsert({
    where: { email }, update: {},
    create: { email, name: 'Arshu', role: 'OWNER', passwordHash: await bcrypt.hash(pw, 12) },
  });
  await db.themeSetting.upsert({ where: { id: 'active' }, update: {}, create: { id: 'active', published: DEFAULT_THEME as any } });
  await db.siteSetting.upsert({
    where: { key: 'hero' }, update: {},
    create: { key: 'hero', value: {
      title: 'ARSHU', subtitle: 'Fashion Portfolio',
      tagline: 'Tradition in Every Thread, Modernity in Every Design.',
      videoUrl: '', posterUrl: '', mobilePosterUrl: '', ctaLabel: 'Explore Collections', ctaHref: '/collections',
    } },
  });
  console.log('Seeded admin + defaults. Remove SEED_* from .env now.');
}
main().finally(() => db.$disconnect());
