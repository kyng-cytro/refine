import { db, orm, schema } from "@/lib/db"

const u = schema.usage
const s = schema.sessions
const DAY_MS = 86_400_000

const sumTotal = orm.sql<number>`coalesce(sum(json_extract(${u.tokens}, '$.total')), 0)`
const dayExpr = orm.sql<string>`strftime('%Y-%m-%d', ${u.createdAt} / 1000, 'unixepoch')`
const modelKey = orm.sql<string>`json_extract(${u.model}, '$.id')`
const toneKey = orm.sql<string>`json_extract(${u.tone}, '$.slug')`

export const getUsage = async (days: number) => {
  const where =
    days > 0
      ? orm.gte(u.createdAt, new Date(Date.now() - days * DAY_MS))
      : undefined

  const [totals] = await db
    .select({ refines: orm.count(), tokens: sumTotal })
    .from(u)
    .where(where)

  const byDay = await db
    .select({ day: dayExpr, refines: orm.count(), tokens: sumTotal })
    .from(u)
    .where(where)
    .groupBy(dayExpr)
    .orderBy(dayExpr)

  const byModel = await db
    .select({
      key: modelKey,
      refines: orm.count(),
      inputTokens: orm.sql<number>`coalesce(sum(json_extract(${u.tokens}, '$.input')), 0)`,
      outputTokens: orm.sql<number>`coalesce(sum(json_extract(${u.tokens}, '$.output')), 0)`,
      tokens: sumTotal,
      cost: orm.sql<number | null>`sum(json_extract(${u.cost}, '$.total'))`,
    })
    .from(u)
    .where(where)
    .groupBy(modelKey)
    .orderBy(orm.sql`count(*) desc`)

  const byTone = await db
    .select({ key: toneKey, refines: orm.count(), tokens: sumTotal })
    .from(u)
    .where(where)
    .groupBy(toneKey)
    .orderBy(orm.sql`count(*) desc`)

  const byDevice = await db
    .select({
      key: orm.sql<string>`coalesce(${s.deviceName}, 'Unknown')`,
      refines: orm.count(),
    })
    .from(u)
    .leftJoin(s, orm.eq(u.sessionId, s.id))
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
