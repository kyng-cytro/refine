import type { AppRouteHandler, AuthenticatedContext } from "@/lib/context"
import * as dal from "@/routes/auth/auth.dal"
import type { Me, Pair } from "@/routes/auth/auth.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const pair: AppRouteHandler<Pair> = async (c) => {
  try {
    const { pairingToken, deviceName } = c.req.valid("json")
    const token = await dal.findUnusedToken(pairingToken)
    if (!token) {
      return c.json(
        { message: "Invalid or already used pairing token" },
        HttpStatusCodes.UNAUTHORIZED,
      )
    }
    const session = await dal.createSession(token.id, deviceName)
    return c.json({ sessionToken: session.sessionToken }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[AUTH:PAIR] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to pair device",
    })
  }
}

export const me: AppRouteHandler<Me, AuthenticatedContext> = async (c) => {
  try {
    const { session } = c.var
    return c.json(
      {
        id: session.id,
        deviceName: session.deviceName,
        createdAt: session.createdAt.getTime(),
      },
      HttpStatusCodes.OK,
    )
  } catch (error) {
    c.var.logger.error(`[AUTH:ME] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch session",
    })
  }
}
