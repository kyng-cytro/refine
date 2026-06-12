import { env } from "bun"
import consola from "consola"
import { z, type ZodError } from "zod"

export const schema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("http://localhost:3000"),
  APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  DATABASE_URL: z.string().optional(),
  TURSO_DATABASE_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
  ADMIN_TOKEN: z.string().min(1, "ADMIN_TOKEN is required"),
  ENCRYPTION_KEY: z.string().min(1, "ENCRYPTION_KEY is required"),
})

export const check = () => {
  try {
    const parsed = schema.parse(env)
    if (!parsed.DATABASE_URL && !parsed.TURSO_DATABASE_URL) {
      consola.error("Either DATABASE_URL or TURSO_DATABASE_URL is required")
      process.exit(1)
    }
  } catch (err) {
    consola.error(z.prettifyError(err as ZodError))
    process.exit(1)
  }
}

type AppEnv = z.infer<typeof schema>

declare module "bun" {
  interface Env extends AppEnv {}
}
