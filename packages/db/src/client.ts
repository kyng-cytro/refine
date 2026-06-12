import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

export * as orm from "drizzle-orm"

export const getClient = (url: string, authToken?: string) => {
  const client = createClient({ url, authToken })
  const db = drizzle({ client, schema })
  return { db, client }
}
