import { env } from "bun"
import consola from "consola"
import { z, type ZodError } from "zod"

export const schema = z.object({
  APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  DATABASE_URL: z.string().default("./refine.db"),
  ADMIN_TOKEN: z.string().min(1, "ADMIN_TOKEN is required"),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("http://localhost:3000"),
})

export const check = () => {
  try {
    schema.parse(env)
  } catch (err) {
    consola.error(z.prettifyError(err as ZodError))
    process.exit(1)
  }
}

type AppEnv = z.infer<typeof schema>

declare module "bun" {
  interface Env extends AppEnv {}
}
