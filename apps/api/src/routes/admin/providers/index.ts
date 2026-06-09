import { createRouter } from "@/lib/create-app"
import * as routes from "@/routes/admin/providers/providers.routes"
import * as handlers from "@/routes/admin/providers/providers.handlers"

const router = createRouter()
  .openapi(routes.upsert, handlers.upsert)
  .openapi(routes.toggleModel, handlers.toggleModel)

export default router
