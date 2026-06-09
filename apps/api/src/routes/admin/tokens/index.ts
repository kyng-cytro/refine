import { createRouter } from "@/lib/create-app"
import * as routes from "@/routes/admin/tokens/tokens.routes"
import * as handlers from "@/routes/admin/tokens/tokens.handlers"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)

export default router
