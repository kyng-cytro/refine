import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  dialect: "turso",
  schema: "./src/schema/index.ts",
  verbose: true,
  dbCredentials: {
    url: process.env["DATABASE_URL"] ?? "file:./refine.db",
    authToken: process.env["TURSO_AUTH_TOKEN"],
  },
})
