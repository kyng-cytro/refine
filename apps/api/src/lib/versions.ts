import pkg from "../../package.json"
import type { Context } from "hono"
import {
  UNSUPPORTED_CLIENT_CODE,
  type ServerMeta,
  type UpgradeRequired,
} from "@refine/schemas"
import {
  CLIENT_HEADER,
  compareVersions,
  isClientKind,
  LATEST_VERSIONS,
  LEGACY_CLIENT_VERSIONS,
  MIN_CLIENT_VERSIONS,
} from "@refine/versions"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const SERVER_VERSION: string = pkg.version

export const serverMeta: ServerMeta = {
  version: SERVER_VERSION,
  clients: {
    desktop: { min: MIN_CLIENT_VERSIONS.desktop, latest: LATEST_VERSIONS.desktop },
    mobile: { min: MIN_CLIENT_VERSIONS.mobile, latest: LATEST_VERSIONS.mobile },
  },
}

export const clientVersion = (c: Context): string | null =>
  c.req.header(CLIENT_HEADER) ?? null

export const unsupportedClient = (
  c: Context,
  deviceType: string,
  version: string | null,
) => {
  if (!isClientKind(deviceType)) return null
  const min = MIN_CLIENT_VERSIONS[deviceType]
  const current = version ?? LEGACY_CLIENT_VERSIONS[deviceType]
  if (compareVersions(current, min) >= 0) return null
  const body: UpgradeRequired = {
    message: `This server needs Refine ${deviceType} ${min} or later. Update the app to keep using it.`,
    code: UNSUPPORTED_CLIENT_CODE,
    min,
  }
  return c.json(body, HttpStatusCodes.UPGRADE_REQUIRED)
}
