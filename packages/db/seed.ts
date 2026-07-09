import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./src/schema"

const url = process.env.DATABASE_URL
if (!url) throw new Error("DATABASE_URL is required")
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
const db = drizzle({ client, schema })

console.log("Seeding database...")

await db
  .insert(schema.tones)
  .values([
    {
      sessionId: null,
      name: "Refined",
      slug: "refined",
      instructions:
        "Make the text clearer, more concise, and more professional while preserving the original meaning.",
      isGlobal: true,
    },
    {
      sessionId: null,
      name: "Polish",
      slug: "polish",
      instructions:
        "Correct all grammar, spelling, and punctuation errors, and rephrase awkward or confusing sentences so the text is clear and easy to understand. Preserve the original meaning, tone, and voice — do not make it more formal or casual, only fix and clarify.",
      isGlobal: true,
    },
    {
      sessionId: null,
      name: "Formal",
      slug: "formal",
      instructions:
        "Rewrite the text in a formal, professional tone suitable for business or official communication. Use complete sentences, avoid contractions and slang, and choose precise, courteous wording while preserving the original meaning.",
      isGlobal: true,
    },
    {
      sessionId: null,
      name: "Friendly",
      slug: "friendly",
      instructions:
        "Rewrite the text in a warm, friendly, and conversational tone. Use approachable language and contractions where natural, keep it upbeat and easy to read, and preserve the original meaning.",
      isGlobal: true,
    },
    {
      sessionId: null,
      name: "Concise",
      slug: "concise",
      instructions:
        "Shorten the text as much as possible without losing meaning. Remove filler words, redundancy, and unnecessary detail, and prefer short, direct sentences while keeping the tone intact.",
      isGlobal: true,
    },
    {
      sessionId: null,
      name: "Confident",
      slug: "confident",
      instructions:
        "Rewrite the text to sound confident and assertive. Remove hedging and tentative phrases (e.g. 'I think', 'maybe', 'just'), use direct and decisive wording, and preserve the original meaning.",
      isGlobal: true,
    },
  ])
  .onConflictDoNothing()

console.log("Seeding complete.")
client.close()
