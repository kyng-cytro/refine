import { createRouter } from "@/lib/create-app"
import * as handlers from "@/routes/admin/history/history.handlers"
import * as routes from "@/routes/admin/history/history.routes"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.removeAll, handlers.removeAll)

export default router
