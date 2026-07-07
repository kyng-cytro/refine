import { HOST } from "@/lib/constants"
import { db, orm, schema } from "@/lib/db"
import type { DeviceType } from "@refine/schemas"
import { randomUUIDv7 } from "bun"

const map = (row: typeof schema.pairingTokens.$inferSelect) => ({
  id: row.id,
  token: row.token,
  label: row.label,
  used: row.used,
  deviceType: row.deviceType,
  createdAt: row.createdAt.getTime(),
  link: `${HOST}/pair?token=${row.token}&name=${encodeURIComponent(row.label)}&type=${row.deviceType}`,
})

export const getAll = async () => {
  const rows = await db.query.pairingTokens.findMany({
    orderBy: (t) => [orm.desc(t.createdAt)],
  })
  return rows.map(map)
}

export const create = async (label: string, deviceType: DeviceType) => {
  const token = randomUUIDv7()
  const [row] = await db
    .insert(schema.pairingTokens)
    .values({ token, label, deviceType })
    .returning()
  return map(row!)
}
