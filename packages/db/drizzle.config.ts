import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  dialect: "sqlite",
  schema: "./src/schema/index.ts",
  verbose: true,
  dbCredentials: {
    url: process.env["DATABASE_URL"] ?? "./refine.db",
  },
})
