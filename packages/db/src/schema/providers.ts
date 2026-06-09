import { uuid } from "./uuid"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const providers = sqliteTable("providers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuid()),
  provider: text("provider", {
    enum: ["openai", "anthropic", "google"],
  })
    .notNull()
    .unique(),
  apiKey: text("api_key").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})
