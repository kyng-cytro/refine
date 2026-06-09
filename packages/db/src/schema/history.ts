import { uuid } from "./uuid"
import { relations } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { sessions } from "./pairing"

export const history = sqliteTable("history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuid()),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  refined: text("refined").notNull(),
  modelId: text("model_id").notNull(),
  toneSlug: text("tone_slug").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const historyRelations = relations(history, ({ one }) => ({
  session: one(sessions, {
    fields: [history.sessionId],
    references: [sessions.id],
  }),
}))
