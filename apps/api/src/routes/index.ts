import { createRouter } from "@/lib/create-app"
import auth from "@/routes/auth"
import refine from "@/routes/refine"
import history from "@/routes/history"
import tones from "@/routes/tones"
import providers from "@/routes/providers"
import admin from "@/routes/admin"

const router = createRouter()
  .route("/", auth)
  .route("/", refine)
  .route("/", history)
  .route("/", tones)
  .route("/", providers)
  .route("/", admin)

export default router
