import { security } from "@/lib/helpers"
import * as responses from "@/lib/helpers/responses"
import { authenticate } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import {
  HistoryItemSchema,
  HistoryQuerySchema,
  HistoryResponseSchema,
  IdParamSchema,
} from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"

const tags = ["History"]

export const list = createRoute({
  method: "get",
  path: "/history",
  tags,
  security,
  middleware: [authenticate] as const,
  request: {
    query: HistoryQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      HistoryResponseSchema,
      "Paginated history",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List refinement history",
})

export const remove = createRoute({
  method: "delete",
  path: "/history/{id}",
  tags,
  security,
  middleware: [authenticate] as const,
  request: {
    params: IdParamSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Deleted" },
    ...responses.unauthorized,
    ...responses.notFound,
    ...responses.serverError,
  },
  summary: "Delete a history item",
})

export type List = typeof list
export type Remove = typeof remove
