import { uuid } from "./uuid"
import { relations, sql } from "drizzle-orm"
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { sessions } from "./pairing"

export const userModelPrefs = sqliteTable(
  "user_model_prefs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuid()),
    sessionId: text("session_id").references(() => sessions.id, {
      onDelete: "cascade",
    }),
    modelId: text("model_id").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [
    uniqueIndex("user_model_prefs_session_model_unique")
      .on(t.sessionId, t.modelId)
      .where(sql`${t.sessionId} IS NOT NULL`),
    uniqueIndex("user_model_prefs_global_model_unique")
      .on(t.modelId)
      .where(sql`${t.sessionId} IS NULL`),
  ],
)

export const userModelPrefsRelations = relations(userModelPrefs, ({ one }) => ({
  session: one(sessions, {
    fields: [userModelPrefs.sessionId],
    references: [sessions.id],
  }),
}))
