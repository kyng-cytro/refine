import * as responses from "@/lib/helpers/responses"
import { adminAuth } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import {
  HistoryItemSchema,
  HistoryQuerySchema,
  IdParamSchema,
  paginationResponse,
} from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"

const tags = ["Admin / History"]

export const AdminHistoryItemSchema = HistoryItemSchema.extend({
  deviceName: z.string().nullable(),
  sessionId: z.string(),
})

export const AdminHistoryResponseSchema = paginationResponse(AdminHistoryItemSchema)

export const list = createRoute({
  method: "get",
  path: "/admin/history",
  tags,
  middleware: [adminAuth] as const,
  request: { query: HistoryQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(AdminHistoryResponseSchema, "Paginated history"),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List all refinement history",
})

export const remove = createRoute({
  method: "delete",
  path: "/admin/history/{id}",
  tags,
  middleware: [adminAuth] as const,
  request: { params: IdParamSchema },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Deleted" },
    ...responses.unauthorized,
    ...responses.notFound,
    ...responses.serverError,
  },
  summary: "Delete a history item",
})

export const removeAll = createRoute({
  method: "delete",
  path: "/admin/history",
  tags,
  middleware: [adminAuth] as const,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "All history deleted" },
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "Delete all history",
})

export type List = typeof list
export type Remove = typeof remove
export type RemoveAll = typeof removeAll
