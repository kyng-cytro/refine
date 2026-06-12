import * as responses from "@/lib/helpers/responses"
import { adminAuth } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import { IdParamSchema } from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"

const tags = ["Admin / Sessions"]

export const SessionSchema = z.object({
  id: z.string(),
  deviceName: z.string(),
  createdAt: z.number(),
  pairingTokenLabel: z.string(),
})

export const list = createRoute({
  method: "get",
  path: "/admin/sessions",
  tags,
  middleware: [adminAuth] as const,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.array(SessionSchema),
      "Connected devices",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List connected devices",
})

export const remove = createRoute({
  method: "delete",
  path: "/admin/sessions/{id}",
  tags,
  middleware: [adminAuth] as const,
  request: {
    params: IdParamSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Revoked" },
    ...responses.unauthorized,
    ...responses.notFound,
    ...responses.serverError,
  },
  summary: "Revoke a device session",
})

export type List = typeof list
export type Remove = typeof remove
