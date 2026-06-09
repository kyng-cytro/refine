import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import * as schema from "./schema"

export * as orm from "drizzle-orm"

export const getClient = (url: string) => {
  const client = new Database(url)
  const db = drizzle({ client, schema })
  return { db, client }
}
