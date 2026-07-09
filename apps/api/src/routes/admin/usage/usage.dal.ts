import { db, orm, schema } from "@/lib/db"

const h = schema.history
const s = schema.sessions
const DAY_MS = 86_400_000

const sumTotal = orm.sql<number>`coalesce(sum(${h.totalTokens}), 0)`
const dayExpr = orm.sql<string>`strftime('%Y-%m-%d', ${h.createdAt} / 1000, 'unixepoch')`

export const getUsage = async (days: number) => {
  const base = orm.eq(h.isPrivate, false)
  const where =
    days > 0
      ? orm.and(base, orm.gte(h.createdAt, new Date(Date.now() - days * DAY_MS)))
      : base

  const [totals] = await db
    .select({ refines: orm.count(), tokens: sumTotal })
    .from(h)
    .where(where)

  const byDay = await db
    .select({ day: dayExpr, refines: orm.count(), tokens: sumTotal })
    .from(h)
    .where(where)
    .groupBy(dayExpr)
    .orderBy(dayExpr)

  const byModel = await db
    .select({
      key: h.modelId,
      refines: orm.count(),
      inputTokens: orm.sql<number>`coalesce(sum(${h.inputTokens}), 0)`,
      outputTokens: orm.sql<number>`coalesce(sum(${h.outputTokens}), 0)`,
      tokens: sumTotal,
    })
    .from(h)
    .where(where)
    .groupBy(h.modelId)
    .orderBy(orm.sql`count(*) desc`)

  const byTone = await db
    .select({ key: h.toneSlug, refines: orm.count(), tokens: sumTotal })
    .from(h)
    .where(where)
    .groupBy(h.toneSlug)
    .orderBy(orm.sql`count(*) desc`)

  const byDevice = await db
    .select({
      key: orm.sql<string>`coalesce(${s.deviceName}, 'Unknown')`,
      refines: orm.count(),
    })
    .from(h)
    .leftJoin(s, orm.eq(h.sessionId, s.id))
    .where(where)
    .groupBy(s.deviceName)
    .orderBy(orm.sql`count(*) desc`)

  return {
    totals: totals ?? { refines: 0, tokens: 0 },
    byDay,
    byModel,
    byTone,
    byDevice,
  }
}
