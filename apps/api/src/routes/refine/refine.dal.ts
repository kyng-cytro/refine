import { decrypt } from "@/lib/crypto"
import { db, orm, schema } from "@/lib/db"
import type { ModelProvider } from "@refine/schemas"

export const getProvider = async (provider: ModelProvider) => {
  const row = await db.query.providers.findFirst({
    where: orm.and(
      orm.eq(schema.providers.slug, provider),
      orm.eq(schema.providers.enabled, true),
    ),
  })
  if (!row) return undefined
  return { ...row, apiKey: await decrypt(row.apiKey) }
}

export const resolveTone = async (sessionId: string, toneSlug: string) => {
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
  isPrivate?: boolean
}) => {
  const [row] = await db.insert(schema.history).values(data).returning()
  return row!
}

export const saveUsage = async (data: {
  sessionId: string
  historyId: string | null
  model: { id: string; label: string; provider: string }
  tone: { slug: string; name: string }
  tokens: { total: number | null; input: number | null; output: number | null } | null
  cost: { total: number; input: number; output: number } | null
}) => {
  const [row] = await db.insert(schema.usage).values(data).returning()
  return row!
}
