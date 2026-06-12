import { createRouter } from "@/lib/create-app"
import * as handlers from "@/routes/admin/sessions/sessions.handlers"
import * as routes from "@/routes/admin/sessions/sessions.routes"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.remove, handlers.remove)

export default router
