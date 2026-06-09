import { createRouter } from "@/lib/create-app"
import * as routes from "@/routes/auth/auth.routes"
import * as handlers from "@/routes/auth/auth.handlers"

const router = createRouter()
  .openapi(routes.pair, handlers.pair)
  .openapi(routes.me, handlers.me)

export default router
