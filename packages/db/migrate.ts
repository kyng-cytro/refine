import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"

const url = process.env.DATABASE_URL
if (!url) throw new Error("DATABASE_URL is required")

const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
const db = drizzle({ client })

console.log(`Running migrations on ${url}...`)
await migrate(db, { migrationsFolder: `${import.meta.dir}/drizzle` })
console.log("Migrations complete.")
client.close()
