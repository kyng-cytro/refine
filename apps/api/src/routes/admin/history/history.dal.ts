import { db, orm, paginate, schema } from "@/lib/db"
import type { HistoryQuery } from "@refine/schemas"

export const list = async (query: HistoryQuery) => {
  const rows = await db.query.history.findMany({
    ...paginate.options(query, {
      column: schema.history.id,
      order: [orm.desc(schema.history.createdAt), orm.desc(schema.history.id)],
      direction: "desc",
    }),
    with: { session: true },
  })
  type Row = typeof schema.history.$inferSelect & {
    session: typeof schema.sessions.$inferSelect
  }
  return paginate.format(rows as Row[], {
    limit: query.limit,
    getCursor: (item: Row) => item.id,
    map: (item: Row) => ({
      id: item.id,
      source: item.source,
      refined: item.refined,
      modelId: item.modelId,
      toneSlug: item.toneSlug,
      createdAt: item.createdAt.getTime(),
      deviceName: item.session.deviceName,
      sessionId: item.sessionId,
    }),
  })
}
