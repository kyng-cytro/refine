import { createRouter } from "@/lib/create-app"
import admin from "@/routes/admin"
import auth from "@/routes/auth"
import history from "@/routes/history"
import providers from "@/routes/providers"
import refine from "@/routes/refine"
import tones from "@/routes/tones"

const router = createRouter()
  .route("/", auth)
  .route("/", admin)
  .route("/", tones)
  .route("/", refine)
  .route("/", history)
  .route("/", providers)

export default router
