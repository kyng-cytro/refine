import { configureOpenAPI } from "@/lib/configure-openapi"
import { createApp, createRouter } from "@/lib/create-app"
import routes from "@/routes"
import consola from "consola"
import { serveStatic } from "hono/bun"
import { notFound, onError } from "stoker/middlewares"

const app = createApp()

app.onError(onError)
app.notFound(notFound)

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer Auth", {
  type: "http",
  scheme: "bearer",
})

configureOpenAPI(app)
app.route("/", routes)

// Root wrapper: serves admin UI outside the /v1 basePath
const root = createRouter()
root.use("/admin/*", serveStatic({ root: "./public" }))
root.get("/admin", (c) => c.redirect("/admin/"))
root.route("/", app)

process.on("unhandledRejection", (reason) => {
  consola.error("Unhandled Rejection:", reason)
})

process.on("uncaughtException", (err) => {
  consola.error("Uncaught Exception:", err)
})

export type AppType = typeof root
export default { fetch: root.fetch }
