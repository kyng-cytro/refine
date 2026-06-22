import { encrypt } from "@/lib/crypto"
import { db, orm, schema } from "@/lib/db"
import type { ModelProvider } from "@refine/schemas"

export const upsert = async (
  provider: ModelProvider,
  apiKey: string | undefined,
  enabled: boolean,
) => {
  if (apiKey !== undefined) {
    const encryptedKey = await encrypt(apiKey)
    const [row] = await db
      .insert(schema.providers)
      .values({ slug: provider, apiKey: encryptedKey, enabled })
      .onConflictDoUpdate({
        target: schema.providers.slug,
        set: { apiKey: encryptedKey, enabled, updatedAt: new Date() },
      })
      .returning()
    return row!
  }

  const [row] = await db
    .update(schema.providers)
    .set({ enabled, updatedAt: new Date() })
    .where(orm.eq(schema.providers.slug, provider))
    .returning()
  if (!row) throw new Error(`Provider ${provider} not configured`)
  return row
}

export const isConfigured = async (): Promise<boolean> => {
  const row = await db.query.providers.findFirst({
    where: orm.eq(schema.providers.enabled, true),
  })
  return !!row
}

export const toggleModel = async (
  modelId: string,
  enabled: boolean,
  sessionId: string | null = null,
) => {
  if (sessionId === null) {
    const [row] = await db
      .insert(schema.userModelPrefs)
      .values({ sessionId: null, modelId, enabled })
      .onConflictDoUpdate({
        target: schema.userModelPrefs.modelId,
        targetWhere: orm.isNull(schema.userModelPrefs.sessionId),
        set: { enabled },
      })
      .returning()
    return row!
  }

  const [row] = await db
    .insert(schema.userModelPrefs)
    .values({ sessionId, modelId, enabled })
    .onConflictDoUpdate({
      target: [schema.userModelPrefs.sessionId, schema.userModelPrefs.modelId],
      targetWhere: orm.isNotNull(schema.userModelPrefs.sessionId),
      set: { enabled },
    })
    .returning()
  return row!
}

export const clearSessionModel = async (modelId: string, sessionId: string) => {
  await db
    .delete(schema.userModelPrefs)
    .where(
      orm.and(
        orm.eq(schema.userModelPrefs.sessionId, sessionId),
        orm.eq(schema.userModelPrefs.modelId, modelId),
      ),
    )
}
