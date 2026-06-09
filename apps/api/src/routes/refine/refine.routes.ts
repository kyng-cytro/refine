import { security } from "@/lib/helpers"
import * as responses from "@/lib/helpers/responses"
import { authenticate } from "@/middlewares/auth"
import { createRoute } from "@hono/zod-openapi"
import { RefineRequestSchema, RefineResponseSchema } from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"
import { createErrorSchema } from "stoker/openapi/schemas"

const tags = ["Refine"]

export const refine = createRoute({
  method: "post",
  path: "/refine",
  tags,
  security,
  middleware: [authenticate] as const,
  request: {
    body: helpers.jsonContent(RefineRequestSchema, "Refine request"),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      RefineResponseSchema,
      "Refined text",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(RefineRequestSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.badRequest,
    ...responses.serverError,
  },
  summary: "Refine text using the configured AI provider",
})

export type Refine = typeof refine
