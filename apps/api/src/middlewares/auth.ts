import { db, schema, orm } from "@/lib/db"
import type { CustomContext } from "@/lib/context"
import { clientVersion, unsupportedClient } from "@/lib/versions"
import { env } from "bun"
import { createMiddleware } from "hono/factory"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

export const authenticate = createMiddleware<CustomContext>(async (c, next) => {
  const header = c.req.header("Authorization")
  const token = header?.replace("Bearer ", "").trim()
  if (!token) {
    return c.json(
      { message: HttpStatusPhrases.UNAUTHORIZED },
      HttpStatusCodes.UNAUTHORIZED,
    )
  }
  const session = await db.query.sessions.findFirst({
    where: orm.eq(schema.sessions.sessionToken, token),
  })
  if (!session || (session.expiresAt && session.expiresAt < new Date())) {
    return c.json(
      { message: HttpStatusPhrases.UNAUTHORIZED },
      HttpStatusCodes.UNAUTHORIZED,
    )
  }
  const version = clientVersion(c)
  const rejected = unsupportedClient(c, session.deviceType, version)
  if (rejected) return rejected
  if (version && version !== session.clientVersion) {
    await db
      .update(schema.sessions)
      .set({ clientVersion: version })
      .where(orm.eq(schema.sessions.id, session.id))
  }
  c.set("session", session)
  return next()
})

export const adminAuth = createMiddleware(async (c, next) => {
  const token = c.req.header("X-Admin-Token")
  if (!token || token !== env.ADMIN_TOKEN) {
    return c.json(
      { message: HttpStatusPhrases.UNAUTHORIZED },
      HttpStatusCodes.UNAUTHORIZED,
    )
  }
  return next()
})
