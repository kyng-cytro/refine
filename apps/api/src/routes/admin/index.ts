import { createRouter } from "@/lib/create-app"
import tokens from "@/routes/admin/tokens"
import tones from "@/routes/admin/tones"
import providers from "@/routes/admin/providers"

const router = createRouter()
  .route("/", tokens)
  .route("/", tones)
  .route("/", providers)

export default router
