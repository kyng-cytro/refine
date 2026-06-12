import * as responses from "@/lib/helpers/responses"
import { adminAuth } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"
import { createErrorSchema } from "stoker/openapi/schemas"

const tags = ["Admin / Tokens"]

const CreateSchema = z.object({
  label: z.string().min(1),
})

const TokenSchema = z.object({
  id: z.string(),
  token: z.string(),
  label: z.string(),
  used: z.boolean(),
  createdAt: z.number(),
  link: z.string(),
})

export const list = createRoute({
  method: "get",
  path: "/admin/tokens",
  tags,
  middleware: [adminAuth] as const,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.array(TokenSchema),
      "Pairing tokens",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List all pairing tokens",
})

export const create = createRoute({
  method: "post",
  path: "/admin/tokens",
  tags,
  middleware: [adminAuth] as const,
  request: {
    body: helpers.jsonContent(CreateSchema, "Create token"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: helpers.jsonContent(
      TokenSchema,
      "Created token",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(CreateSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "Create a pairing token",
})

export type List = typeof list
export type Create = typeof create
