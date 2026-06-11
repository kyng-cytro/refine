import { BASE_PATH } from "@/lib/constants"
import { check } from "@/lib/env"
import { logger } from "@/middlewares/pino"
import { OpenAPIHono } from "@hono/zod-openapi"
import { env } from "bun"
import consola from "consola"
import { cors } from "hono/cors"
import { requestId } from "hono/request-id"
import { secureHeaders } from "hono/secure-headers"
import defaultHook from "stoker/openapi/default-hook"

export const createRouter = () => {
  return new OpenAPIHono({
    strict: false,
    defaultHook,
  })
}

export const createApp = () => {
  consola.info("Checking environment...")
  check()

  consola.info("Creating app...")
  const app = createRouter()

  consola.info("Injecting middlewares...")
  app.use(requestId())
  app.use(logger())
  app.use(secureHeaders())
  app.use(
    cors({
      origin: env.APP_ENV === "production" ? [] : "*",
    }),
  )
  return app.basePath(BASE_PATH)
}
