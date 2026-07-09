import * as responses from "@/lib/helpers/responses"
import { adminAuth } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import { UsageOverviewSchema } from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"

const tags = ["Admin / Usage"]

export const get = createRoute({
  method: "get",
  path: "/admin/usage",
  tags,
  middleware: [adminAuth] as const,
  request: {
    query: z.object({
      days: z.coerce.number().int().nonnegative().default(30),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      UsageOverviewSchema,
      "Usage overview",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "Aggregate usage overview",
})

export type GetUsage = typeof get
