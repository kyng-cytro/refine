import type { AppRouteHandler } from "@/lib/context"
import { serverMeta } from "@/lib/versions"
import type { Get } from "@/routes/meta/meta.routes"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const get: AppRouteHandler<Get> = (c) =>
  c.json(serverMeta, HttpStatusCodes.OK)
