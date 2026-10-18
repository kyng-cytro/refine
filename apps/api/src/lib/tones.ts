import type { schema } from "@/lib/db"

export const mapTone = (row: typeof schema.tones.$inferSelect) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  instructions: row.instructions,
  isGlobal: row.isGlobal,
  sessionId: row.sessionId,
})
