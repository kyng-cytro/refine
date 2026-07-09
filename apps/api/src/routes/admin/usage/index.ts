import { createRouter } from "@/lib/create-app"
import * as handlers from "@/routes/admin/usage/usage.handlers"
import * as routes from "@/routes/admin/usage/usage.routes"

const router = createRouter().openapi(routes.get, handlers.get)

export default router
