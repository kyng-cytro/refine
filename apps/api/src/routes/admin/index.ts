import { createRouter } from "@/lib/create-app"
import history from "@/routes/admin/history"
import providers from "@/routes/admin/providers"
import sessions from "@/routes/admin/sessions"
import tokens from "@/routes/admin/tokens"
import tones from "@/routes/admin/tones"
import usage from "@/routes/admin/usage"

const router = createRouter()
  .route("/", tokens)
  .route("/", tones)
  .route("/", providers)
  .route("/", sessions)
  .route("/", history)
  .route("/", usage)

export default router
