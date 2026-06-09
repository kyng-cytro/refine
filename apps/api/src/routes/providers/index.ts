import { createRouter } from "@/lib/create-app"
import * as routes from "@/routes/providers/providers.routes"
import * as handlers from "@/routes/providers/providers.handlers"

const router = createRouter().openapi(routes.list, handlers.list)

export default router
