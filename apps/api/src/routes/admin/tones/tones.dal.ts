import { db, schema, orm } from "@/lib/db"
import type { CreateTone, UpdateTone } from "@refine/schemas"

const mapTone = (row: typeof schema.tones.$inferSelect) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  instructions: row.instructions,
  isGlobal: row.isGlobal,
  sessionId: row.sessionId,
})

export const getAll = async () => {
  const rows = await db.query.tones.findMany({
    where: orm.eq(schema.tones.isGlobal, true),
    orderBy: (t) => [orm.asc(t.name)],
  })
  return rows.map(mapTone)
}

export const create = async (data: CreateTone) => {
  const [row] = await db
    .insert(schema.tones)
    .values({ ...data, sessionId: null, isGlobal: true })
    .returning()
  return row ? mapTone(row) : null
}

export const update = async (id: string, data: UpdateTone) => {
  const [row] = await db
    .update(schema.tones)
    .set({ ...data, updatedAt: new Date() })
    .where(
      orm.and(orm.eq(schema.tones.id, id), orm.eq(schema.tones.isGlobal, true)),
    )
    .returning()
  return row ? mapTone(row) : null
}

export const remove = async (id: string) => {
  const [deleted] = await db
    .delete(schema.tones)
    .where(
      orm.and(orm.eq(schema.tones.id, id), orm.eq(schema.tones.isGlobal, true)),
    )
    .returning()
  return deleted ?? null
}
