import { db, orm, schema } from "@/lib/db"

export const getAll = async () => {
  return db.query.sessions.findMany({
    with: { pairingToken: true },
    orderBy: (s) => [orm.desc(s.createdAt)],
  })
}

export const remove = async (id: string) => {
  const [deleted] = await db
    .delete(schema.sessions)
    .where(orm.eq(schema.sessions.id, id))
    .returning()
  return deleted ?? null
}
