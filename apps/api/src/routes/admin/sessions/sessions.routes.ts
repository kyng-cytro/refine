import * as responses from "@/lib/helpers/responses"
import { adminAuth } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import { IdParamSchema } from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"
import { createErrorSchema } from "stoker/openapi/schemas"

const tags = ["Admin / Sessions"]

export const SessionSchema = z.object({
  id: z.string(),
  deviceName: z.string(),
  createdAt: z.number(),
  expiresAt: z.number().nullable(),
  pairingTokenLabel: z.string(),
})

const SetExpirySchema = z.object({
  expiresAt: z.number().nullable(),
})

export const list = createRoute({
  method: "get",
  path: "/admin/sessions",
  tags,
  middleware: [adminAuth] as const,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(z.array(SessionSchema), "Connected devices"),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List connected devices",
})

export const expiry = createRoute({
  method: "patch",
  path: "/admin/sessions/{id}",
  tags,
  middleware: [adminAuth] as const,
  request: {
    params: IdParamSchema,
    body: helpers.jsonContent(SetExpirySchema, "Set session expiry"),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(SessionSchema, "Updated session"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(SetExpirySchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.notFound,
    ...responses.serverError,
  },
  summary: "Set or clear session expiry",
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
export type SetExpiry = typeof expiry
export type Remove = typeof remove
