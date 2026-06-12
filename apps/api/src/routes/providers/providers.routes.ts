import { security } from "@/lib/helpers"
import * as responses from "@/lib/helpers/responses"
import { authenticate } from "@/middlewares/auth"
import { createRoute } from "@hono/zod-openapi"
import { ProvidersResponseSchema } from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"

const tags = ["Providers"]

export const list = createRoute({
  method: "get",
  path: "/providers",
  tags,
  security,
  middleware: [authenticate] as const,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      ProvidersResponseSchema,
      "Available providers and models",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List available providers and models",
})

export type List = typeof list
