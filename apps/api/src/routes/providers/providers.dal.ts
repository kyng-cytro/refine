import { db, orm, schema } from "@/lib/db"

export const list = async () => {
  return db.query.providers.findMany({
    where: orm.eq(schema.providers.enabled, true),
  })
}

export const listPrefs = async () => {
  return db.query.userModelPrefs.findMany({
    where: orm.isNull(schema.userModelPrefs.sessionId),
  })
}

export const upsertPref = async (modelId: string, enabled: boolean) => {
  const [row] = await db
    .insert(schema.userModelPrefs)
    .values({ sessionId: null as unknown as string, modelId, enabled })
    .onConflictDoUpdate({
      target: [schema.userModelPrefs.sessionId, schema.userModelPrefs.modelId],
      set: { enabled },
    })
    .returning()
  return row!
}
