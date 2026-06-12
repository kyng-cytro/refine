import { createRouter } from "@/lib/create-app"
import * as handlers from "@/routes/admin/providers/providers.handlers"
import * as routes from "@/routes/admin/providers/providers.routes"

const router = createRouter()
  .openapi(routes.setupStatus, handlers.setupStatus)
  .openapi(routes.listProviders, handlers.listProviders)
  .openapi(routes.upsert, handlers.upsert)
  .openapi(routes.toggleModel, handlers.toggleModel)
  .openapi(routes.toggleSessionModel, handlers.toggleSessionModel)
  .openapi(routes.listSessionModels, handlers.listSessionModels)

export default router
