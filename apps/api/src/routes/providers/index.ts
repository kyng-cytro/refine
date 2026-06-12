import { createRouter } from "@/lib/create-app"
import * as handlers from "@/routes/providers/providers.handlers"
import * as routes from "@/routes/providers/providers.routes"

const router = createRouter().openapi(routes.list, handlers.list)

export default router
