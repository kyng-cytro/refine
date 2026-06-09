import { security } from "@/lib/helpers"
import * as responses from "@/lib/helpers/responses"
import { authenticate } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import {
  CreateToneSchema,
  IdParamSchema,
  ToneSchema,
  UpdateToneSchema,
} from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"
import { createErrorSchema } from "stoker/openapi/schemas"

const tags = ["Tones"]

export const list = createRoute({
  method: "get",
  path: "/tones",
  tags,
  security,
  middleware: [authenticate] as const,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.array(ToneSchema),
      "Tones list",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List user tones and global tones",
})

export const create = createRoute({
  method: "post",
  path: "/tones",
  tags,
  security,
  middleware: [authenticate] as const,
  request: {
    body: helpers.jsonContent(CreateToneSchema, "Create tone"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: helpers.jsonContent(ToneSchema, "Created tone"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(CreateToneSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.conflict,
    ...responses.serverError,
  },
  summary: "Create a user tone",
})

export const update = createRoute({
  method: "put",
  path: "/tones/{id}",
  tags,
  security,
  middleware: [authenticate] as const,
  request: {
    params: IdParamSchema,
    body: helpers.jsonContent(UpdateToneSchema, "Update tone"),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(ToneSchema, "Updated tone"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(UpdateToneSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.notFound,
    ...responses.serverError,
  },
  summary: "Update a user tone",
})

export const remove = createRoute({
  method: "delete",
  path: "/tones/{id}",
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
  summary: "Delete a user tone",
})

export type List = typeof list
export type Create = typeof create
export type Update = typeof update
export type Remove = typeof remove
