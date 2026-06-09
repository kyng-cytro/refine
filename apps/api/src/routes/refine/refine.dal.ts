import { db, schema, orm } from "@/lib/db"
import type { ModelProvider } from "@refine/schemas"

export const getProvider = async (provider: ModelProvider) => {
  return db.query.providers.findFirst({
    where: orm.and(
      orm.eq(schema.providers.provider, provider),
      orm.eq(schema.providers.enabled, true),
    ),
  })
}

export const isModelEnabled = async (modelId: string) => {
  const pref = await db.query.userModelPrefs.findFirst({
    where: orm.and(
      orm.isNull(schema.userModelPrefs.sessionId),
      orm.eq(schema.userModelPrefs.modelId, modelId),
    ),
  })
  // No pref row means admin hasn't restricted it — default enabled
  return pref ? pref.enabled : true
}

export const resolveTone = async (sessionId: string, toneSlug: string) => {
  // User's own tone takes precedence over global
  const userTone = await db.query.tones.findFirst({
    where: orm.and(
      orm.eq(schema.tones.sessionId, sessionId),
      orm.eq(schema.tones.slug, toneSlug),
    ),
  })
  if (userTone) return userTone

  return db.query.tones.findFirst({
    where: orm.and(
      orm.eq(schema.tones.isGlobal, true),
      orm.eq(schema.tones.slug, toneSlug),
    ),
  })
}

export const saveHistory = async (data: {
  sessionId: string
  source: string
  refined: string
  modelId: string
  toneSlug: string
}) => {
  const [row] = await db.insert(schema.history).values(data).returning()
  return row!
}
