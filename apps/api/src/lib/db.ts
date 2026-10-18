import { getClient, orm, paginate, schema } from "@refine/db"
import { env } from "bun"

const { db } = getClient(env.DATABASE_URL, env.TURSO_AUTH_TOKEN)

export { db, orm, paginate, schema }

// Drizzle wraps driver errors, so the constraint message lives on `cause`.
export const isUniqueViolation = (error: unknown): boolean => {
  const err = error as { message?: string; cause?: { message?: string } }
  return [err?.message, err?.cause?.message].some((m) => m?.includes("UNIQUE"))
}
