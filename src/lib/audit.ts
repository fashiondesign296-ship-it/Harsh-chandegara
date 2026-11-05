import { db } from './db';
export async function audit(
  userId: string | null, action: string, entity?: string, entityId?: string,
  meta?: object, source: 'admin' | 'ai' = 'admin',
) {
  await db.auditLog.create({ data: { userId, action, entity, entityId, meta: meta as any, source } });
}
