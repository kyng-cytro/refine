import { createRoute } from "@hono/zod-openapi"
import { ServerMetaSchema } from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"

const tags = ["Meta"]

export const get = createRoute({
  method: "get",
  path: "/meta",
  tags,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      ServerMetaSchema,
      "Server version and supported client versions",
    ),
  },
  summary: "Get server version info",
})

export type Get = typeof get
