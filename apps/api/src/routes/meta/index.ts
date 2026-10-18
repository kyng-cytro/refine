import { createRouter } from "@/lib/create-app"
import * as handlers from "@/routes/meta/meta.handlers"
import * as routes from "@/routes/meta/meta.routes"

const router = createRouter().openapi(routes.get, handlers.get)

export default router
