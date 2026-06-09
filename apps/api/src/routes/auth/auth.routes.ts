import * as responses from "@/lib/helpers/responses"
import { createRoute, z } from "@hono/zod-openapi"
import {
  PairRequestSchema,
  PairResponseSchema,
  SessionInfoSchema,
} from "@refine/schemas"
import { security } from "@/lib/helpers"
import { authenticate } from "@/middlewares/auth"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"
import { createErrorSchema } from "stoker/openapi/schemas"

const tags = ["Auth"]

export const pair = createRoute({
  method: "post",
  path: "/auth/pair",
  tags,
  request: {
    body: helpers.jsonContent(PairRequestSchema, "Pair request"),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      PairResponseSchema,
      "Session token",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(PairRequestSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "Pair a device with a pre-issued token",
})

export const me = createRoute({
  method: "get",
  path: "/auth/me",
  tags,
  security,
  middleware: [authenticate] as const,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      SessionInfoSchema,
      "Session info",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "Get current session info",
})

export type Pair = typeof pair
export type Me = typeof me
