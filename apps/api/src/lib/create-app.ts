import { BASE_PATH, HOST } from "@/lib/constants"
import { check } from "@/lib/env"
import { logger } from "@/middlewares/pino"
import { OpenAPIHono } from "@hono/zod-openapi"
import { env } from "bun"
import consola from "consola"
import { cors } from "hono/cors"
import { serveStatic } from "hono/bun"
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

export const createRoot = (app: ReturnType<typeof createApp>) => {
  const root = createRouter()
  root.get("/favicon.png", serveStatic({ path: "./public/favicon.png" }))
  root.get("/pair", (c) => {
    const { token, name } = c.req.query()
    const deepLink = `refine://pair?token=${token}&url=${encodeURIComponent(HOST)}&name=${name ?? ""}`
    return c.redirect(deepLink, 302)
  })
  root.use("/admin/*", serveStatic({ root: "./public" }))
  root.get("/admin/*", serveStatic({ path: "./public/admin/index.html" }))
  root.get("/admin", (c) => c.redirect("/admin/"))
  root.get("/health", (c) => c.json({ status: "ok" }))
  root.get("/", (c) => c.redirect("/admin/"))
  root.route("/", app)
  return root
}
