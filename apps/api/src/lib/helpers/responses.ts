import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import { helpers } from "stoker/openapi"
import { createMessageObjectSchema } from "stoker/openapi/schemas"

export const unauthorized = {
  [HttpStatusCodes.UNAUTHORIZED]: helpers.jsonContent(
    createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
    HttpStatusPhrases.UNAUTHORIZED,
  ),
}

export const forbidden = {
  [HttpStatusCodes.FORBIDDEN]: helpers.jsonContent(
    createMessageObjectSchema(HttpStatusPhrases.FORBIDDEN),
    HttpStatusPhrases.FORBIDDEN,
  ),
}

export const notFound = {
  [HttpStatusCodes.NOT_FOUND]: helpers.jsonContent(
    createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
    HttpStatusPhrases.NOT_FOUND,
  ),
}

export const conflict = {
  [HttpStatusCodes.CONFLICT]: helpers.jsonContent(
    createMessageObjectSchema(HttpStatusPhrases.CONFLICT),
    HttpStatusPhrases.CONFLICT,
  ),
}

export const badRequest = {
  [HttpStatusCodes.BAD_REQUEST]: helpers.jsonContent(
    createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST),
    HttpStatusPhrases.BAD_REQUEST,
  ),
}

export const serverError = {
  [HttpStatusCodes.INTERNAL_SERVER_ERROR]: helpers.jsonContent(
    createMessageObjectSchema(HttpStatusPhrases.INTERNAL_SERVER_ERROR),
    HttpStatusPhrases.INTERNAL_SERVER_ERROR,
  ),
}

export const unprocessable = {
  [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
    createMessageObjectSchema(HttpStatusPhrases.UNPROCESSABLE_ENTITY),
    HttpStatusPhrases.UNPROCESSABLE_ENTITY,
  ),
}
