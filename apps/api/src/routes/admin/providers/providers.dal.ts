import { encrypt } from "@/lib/crypto"
import { db, orm, schema } from "@/lib/db"
import { MODELS } from "@/lib/models"
import type { ModelProvider } from "@refine/schemas"

export const listAll = async () => {
  const [allProviders, globalPrefs] = await Promise.all([
    db.query.providers.findMany(),
    db.query.userModelPrefs.findMany({
      where: orm.isNull(schema.userModelPrefs.sessionId),
    }),
  ])
  const disabledModels = new Set(globalPrefs.filter((p) => !p.enabled).map((p) => p.modelId))
  return allProviders.map((p) => ({
    provider: p.slug as ModelProvider,
    enabled: p.enabled,
    hasKey: true,
    models: MODELS.filter((m) => m.provider === (p.slug as ModelProvider)).map((m) => ({
      id: m.id,
      label: m.label,
      enabled: !disabledModels.has(m.id),
    })),
  }))
}

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

export const toggleModel = async (modelId: string, enabled: boolean, sessionId: string | null = null) => {
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

export const listSessionModelPrefs = async (sessionId: string) => {
  return db.query.userModelPrefs.findMany({
    where: orm.eq(schema.userModelPrefs.sessionId, sessionId),
  })
}
