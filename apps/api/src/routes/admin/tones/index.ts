import { createRouter } from "@/lib/create-app"
import * as routes from "@/routes/admin/tones/tones.routes"
import * as handlers from "@/routes/admin/tones/tones.handlers"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove)

export default router
