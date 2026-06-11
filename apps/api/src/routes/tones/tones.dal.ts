import { db, orm, schema } from "@/lib/db"
import type { CreateTone, UpdateTone } from "@refine/schemas"

const mapTone = (row: typeof schema.tones.$inferSelect) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  instructions: row.instructions,
  isGlobal: row.isGlobal,
  sessionId: row.sessionId,
})

export const list = async (sessionId: string) => {
  const [userTones, globalTones] = await Promise.all([
    db.query.tones.findMany({
      where: orm.eq(schema.tones.sessionId, sessionId),
    }),
    db.query.tones.findMany({
      where: orm.eq(schema.tones.isGlobal, true),
    }),
  ])
  return [...globalTones.map(mapTone), ...userTones.map(mapTone)]
}

export const create = async (sessionId: string, data: CreateTone) => {
  const [row] = await db
    .insert(schema.tones)
    .values({ ...data, sessionId, isGlobal: false })
    .returning()
  return row ? mapTone(row) : null
}

export const update = async (
  sessionId: string,
  id: string,
  data: UpdateTone,
) => {
  const [row] = await db
    .update(schema.tones)
    .set({ ...data, updatedAt: new Date() })
    .where(
      orm.and(
        orm.eq(schema.tones.id, id),
        orm.eq(schema.tones.sessionId, sessionId),
      ),
    )
    .returning()
  return row ? mapTone(row) : null
}

export const remove = async (sessionId: string, id: string) => {
  const [deleted] = await db
    .delete(schema.tones)
    .where(
      orm.and(
        orm.eq(schema.tones.id, id),
        orm.eq(schema.tones.sessionId, sessionId),
      ),
    )
    .returning()
  return deleted ?? null
}
