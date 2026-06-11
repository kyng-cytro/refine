import { createRouter } from "@/lib/create-app"
import * as handlers from "@/routes/refine/refine.handlers"
import * as routes from "@/routes/refine/refine.routes"

const router = createRouter().openapi(routes.refine, handlers.refine)

export default router
