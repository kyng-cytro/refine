import { configureOpenAPI } from "@/lib/configure-openapi"
import { createApp, createRoot } from "@/lib/create-app"
import routes from "@/routes"
import consola from "consola"
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

const root = createRoot(app)

process.on("unhandledRejection", (reason) => {
  consola.error("Unhandled Rejection:", reason)
})

process.on("uncaughtException", (err) => {
  consola.error("Uncaught Exception:", err)
})

export type AppType = typeof root
export default { fetch: root.fetch }
