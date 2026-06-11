import { db, orm, paginate, schema } from "@/lib/db"
import type { HistoryQuery } from "@refine/schemas"

export const list = async (sessionId: string, query: HistoryQuery) => {
  const rows = await db.query.history.findMany({
    ...paginate.options(query, {
      column: schema.history.id,
      order: [orm.desc(schema.history.createdAt), orm.desc(schema.history.id)],
      where: orm.eq(schema.history.sessionId, sessionId),
      direction: "desc",
    }),
  })
  type Row = typeof schema.history.$inferSelect
  return paginate.format(rows, {
    limit: query.limit,
    getCursor: (item: Row) => item.id,
    map: (item: Row) => ({
      id: item.id,
      source: item.source,
      refined: item.refined,
      modelId: item.modelId,
      toneSlug: item.toneSlug,
      createdAt: item.createdAt.getTime(),
    }),
  })
}

export const remove = async (sessionId: string, id: string) => {
  const [deleted] = await db
    .delete(schema.history)
    .where(
      orm.and(
        orm.eq(schema.history.id, id),
        orm.eq(schema.history.sessionId, sessionId),
      ),
    )
    .returning()
  return deleted ?? null
}
