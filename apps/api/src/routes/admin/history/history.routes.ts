import * as responses from "@/lib/helpers/responses"
import { adminAuth } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import {
  HistoryItemSchema,
  HistoryQuerySchema,
  paginationResponse,
} from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"

const tags = ["Admin / History"]

export const AdminHistoryItemSchema = HistoryItemSchema.extend({
  deviceName: z.string(),
  sessionId: z.string(),
})

export const AdminHistoryResponseSchema = paginationResponse(
  AdminHistoryItemSchema,
)

export const list = createRoute({
  method: "get",
  path: "/admin/history",
  tags,
  middleware: [adminAuth] as const,
  request: {
    query: HistoryQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      AdminHistoryResponseSchema,
      "Paginated history (all devices)",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List all refinement history",
})

export type List = typeof list
