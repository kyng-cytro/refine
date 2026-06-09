import { createRouter } from "@/lib/create-app"
import * as routes from "@/routes/refine/refine.routes"
import * as handlers from "@/routes/refine/refine.handlers"

const router = createRouter().openapi(routes.refine, handlers.refine)

export default router
