import { uuid } from "./uuid"
import { relations } from "drizzle-orm"
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"
import { sessions } from "./pairing"

// sessionId = null means this is an admin-controlled global model pref.
// sessionId = <id> would be per-user (reserved for future use).
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
    unique("user_model_prefs_session_model_unique").on(t.sessionId, t.modelId),
  ],
)

export const userModelPrefsRelations = relations(userModelPrefs, ({ one }) => ({
  session: one(sessions, {
    fields: [userModelPrefs.sessionId],
    references: [sessions.id],
  }),
}))
