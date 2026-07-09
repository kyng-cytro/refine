import { uuid } from "./uuid"
import { relations } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { history } from "./history"
import { sessions } from "./pairing"

export const usage = sqliteTable("usage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuid()),
  sessionId: text("session_id").references(() => sessions.id, {
    onDelete: "set null",
  }),
  historyId: text("history_id").references(() => history.id, {
    onDelete: "set null",
  }),
  model: text("model", { mode: "json" })
    .$type<{ id: string; label: string; provider: string }>()
    .notNull(),
  tone: text("tone", { mode: "json" })
    .$type<{ slug: string; name: string }>()
    .notNull(),
  tokens: text("tokens", { mode: "json" }).$type<{
    total: number | null
    input: number | null
    output: number | null
  }>(),
  cost: text("cost", { mode: "json" }).$type<{
    total: number
    input: number
    output: number
  }>(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const usageRelations = relations(usage, ({ one }) => ({
  session: one(sessions, {
    fields: [usage.sessionId],
    references: [sessions.id],
  }),
  history: one(history, {
    fields: [usage.historyId],
    references: [history.id],
  }),
}))
