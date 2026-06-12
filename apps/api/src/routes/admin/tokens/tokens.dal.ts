import { db, orm, schema } from "@/lib/db"
import { randomUUIDv7 } from "bun"

const map = (row: typeof schema.pairingTokens.$inferSelect) => ({
  id: row.id,
  token: row.token,
  label: row.label,
  used: row.used,
  createdAt: row.createdAt.getTime(),
})

export const getAll = async () => {
  const rows = await db.query.pairingTokens.findMany({
    orderBy: (t) => [orm.desc(t.createdAt)],
  })
  return rows.map(map)
}

export const create = async (label: string) => {
  const token = randomUUIDv7()
  const [row] = await db
    .insert(schema.pairingTokens)
    .values({ token, label })
    .returning()
  return map(row!)
}
