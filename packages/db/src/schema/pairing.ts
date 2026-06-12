import { uuid } from "./uuid"
import { relations } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const pairingTokens = sqliteTable("pairing_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuid()),
  token: text("token").notNull().unique(),
  label: text("label").notNull(),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuid()),
  pairingTokenId: text("pairing_token_id")
    .notNull()
    .references(() => pairingTokens.id, { onDelete: "cascade" }),
  deviceName: text("device_name").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const pairingTokensRelations = relations(pairingTokens, ({ many }) => ({
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  pairingToken: one(pairingTokens, {
    fields: [sessions.pairingTokenId],
    references: [pairingTokens.id],
  }),
}))
