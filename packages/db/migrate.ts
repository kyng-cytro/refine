import { env } from "bun"
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"

const url = env.DATABASE_URL
if (!url) throw new Error("DATABASE_URL is required")
const client = new Database(url)
const db = drizzle({ client })

console.log(`Running migrations on ${url}...`)
migrate(db, { migrationsFolder: "./drizzle" })
console.log("Migrations complete.")
client.close()
