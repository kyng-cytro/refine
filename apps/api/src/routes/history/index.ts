import { createRouter } from "@/lib/create-app"
import * as routes from "@/routes/history/history.routes"
import * as handlers from "@/routes/history/history.handlers"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.remove, handlers.remove)

export default router
