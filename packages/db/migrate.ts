import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"

const url = process.env["DATABASE_URL"] ?? "./refine.db"
const client = new Database(url)
const db = drizzle({ client })

console.log(`Running migrations on ${url}...`)
migrate(db, { migrationsFolder: "./drizzle" })
console.log("Migrations complete.")
client.close()
