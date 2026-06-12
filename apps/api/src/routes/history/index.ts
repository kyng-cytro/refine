import { createRouter } from "@/lib/create-app"
import * as handlers from "@/routes/history/history.handlers"
import * as routes from "@/routes/history/history.routes"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.remove, handlers.remove)

export default router
