import { db, orm, schema } from "@/lib/db"

type SessionRow = typeof schema.sessions.$inferSelect & {
  pairingToken: typeof schema.pairingTokens.$inferSelect
}

const map = (row: SessionRow) => ({
  id: row.id,
  deviceName: row.deviceName,
  createdAt: row.createdAt.getTime(),
  expiresAt: row.expiresAt?.getTime() ?? null,
  pairingTokenLabel: row.pairingToken.label,
})

export const getAll = async () => {
  const rows = await db.query.sessions.findMany({
    with: { pairingToken: true },
    orderBy: (s) => [orm.desc(s.createdAt)],
  })
  return rows.map(map)
}

export const setExpiry = async (id: string, expiresAt: Date | null) => {
  const [updated] = await db
    .update(schema.sessions)
    .set({ expiresAt })
    .where(orm.eq(schema.sessions.id, id))
    .returning()
  return updated ?? null
}

export const remove = async (id: string) => {
  const [deleted] = await db
    .delete(schema.sessions)
    .where(orm.eq(schema.sessions.id, id))
    .returning()
  return deleted ?? null
}
