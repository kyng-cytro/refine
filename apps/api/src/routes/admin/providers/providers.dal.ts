import { db, schema, orm } from "@/lib/db"
import type { ModelProvider } from "@refine/schemas"

export const upsert = async (
  provider: ModelProvider,
  apiKey: string,
  enabled: boolean,
) => {
  const [row] = await db
    .insert(schema.providers)
    .values({ provider, apiKey, enabled })
    .onConflictDoUpdate({
      target: schema.providers.provider,
      set: { apiKey, enabled, updatedAt: new Date() },
    })
    .returning()
  return row!
}

export const toggleModel = async (modelId: string, enabled: boolean) => {
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
