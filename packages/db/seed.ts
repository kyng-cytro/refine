import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import * as schema from "./src/schema"

const url = process.env["DATABASE_URL"] ?? "./refine.db"
const client = new Database(url)
const db = drizzle({ client, schema })

console.log("Seeding database...")

await db
  .insert(schema.tones)
  .values({
    sessionId: null,
    name: "Refined",
    slug: "refined",
    instructions:
      "Make the text clearer, more concise, and more professional while preserving the original meaning.",
    isGlobal: true,
  })
  .onConflictDoNothing()

console.log("Seeding complete.")
client.close()
