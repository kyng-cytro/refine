import { uuid } from "./uuid"
import { relations } from "drizzle-orm"
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"
import { sessions } from "./pairing"

export const tones = sqliteTable(
  "tones",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuid()),
    // null = global tone visible to all users
    sessionId: text("session_id").references(() => sessions.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    instructions: text("instructions").notNull(),
    isGlobal: integer("is_global", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique("tones_session_slug_unique").on(t.sessionId, t.slug)],
)

export const tonesRelations = relations(tones, ({ one }) => ({
  session: one(sessions, {
    fields: [tones.sessionId],
    references: [sessions.id],
  }),
}))
