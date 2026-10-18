import { db, orm, schema } from "@/lib/db"
import { mapTone } from "@/lib/tones"
import type { CreateTone, UpdateTone } from "@refine/schemas"

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
  return mapTone(row!)
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
