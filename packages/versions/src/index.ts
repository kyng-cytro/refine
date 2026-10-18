import {
  LATEST_VERSIONS,
  MIN_CLIENT_VERSIONS,
  MIN_SERVER_VERSIONS,
} from "./generated"

export { LATEST_VERSIONS, MIN_CLIENT_VERSIONS, MIN_SERVER_VERSIONS }

export type ClientKind = "desktop" | "mobile"

export type VersionStatus = "ok" | "outdated" | "unsupported"

export type UpdateTarget = "app" | "server"

export type VersionRange = { min: string; latest: string }

export type ServerVersions = {
  version: string
  clients: Record<ClientKind, VersionRange>
}

export type VersionInfo = {
  app: string
  server: string | null
  latestApp: string | null
  appStatus: VersionStatus
  serverStatus: VersionStatus
}

export type UpdatePrompt = {
  target: UpdateTarget
  blocking: boolean
  title: string
  description: string
}

export const CLIENT_HEADER = "X-Refine-Client-Version"
export const SERVER_HEADER = "X-Refine-Server-Version"

// Clients released before version reporting existed send no header.
export const LEGACY_CLIENT_VERSIONS: Record<ClientKind, string> = {
  desktop: "0.3.1",
  mobile: "0.2.0",
}

export const compareVersions = (a: string, b: string): number => {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0)
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

export const versionStatus = (
  version: string,
  range: VersionRange,
): VersionStatus => {
  if (compareVersions(version, range.min) < 0) return "unsupported"
  if (compareVersions(version, range.latest) < 0) return "outdated"
  return "ok"
}

export const isClientKind = (value: string): value is ClientKind =>
  value === "desktop" || value === "mobile"

const dismissKey = (target: UpdateTarget, version: string) =>
  `${target}@${version}`

export const resolveVersions = (
  kind: ClientKind,
  app: string,
  server: ServerVersions | null,
  dismissed: string[],
): VersionInfo => {
  if (!server) {
    return {
      app,
      server: null,
      latestApp: null,
      appStatus: "ok",
      serverStatus: "ok",
    }
  }
  const appRange = server.clients[kind]
  const serverRange = {
    min: MIN_SERVER_VERSIONS[kind],
    latest: LATEST_VERSIONS.server,
  }
  const unlessDismissed = (status: VersionStatus, key: string) =>
    status === "outdated" && dismissed.includes(key) ? "ok" : status
  return {
    app,
    server: server.version,
    latestApp: appRange.latest,
    appStatus: unlessDismissed(
      versionStatus(app, appRange),
      dismissKey("app", appRange.latest),
    ),
    serverStatus: unlessDismissed(
      versionStatus(server.version, serverRange),
      dismissKey("server", serverRange.latest),
    ),
  }
}

export const dismissalKey = (
  info: VersionInfo,
  target: UpdateTarget,
): string | null => {
  const version = target === "app" ? info.latestApp : LATEST_VERSIONS.server
  return version ? dismissKey(target, version) : null
}

export const isBlocked = (info: VersionInfo): boolean =>
  info.appStatus === "unsupported" || info.serverStatus === "unsupported"

export const updatePrompt = (
  kind: ClientKind,
  info: VersionInfo,
): UpdatePrompt | null => {
  if (info.appStatus === "unsupported") {
    return {
      target: "app",
      blocking: true,
      title: "Update required",
      description: `This server no longer supports Refine v${info.app}. Update the app to keep using it.`,
    }
  }
  if (info.serverStatus === "unsupported") {
    return {
      target: "server",
      blocking: true,
      title: "Server update required",
      description: `This server runs v${info.server}, but this app needs v${MIN_SERVER_VERSIONS[kind]} or later. Ask whoever runs the server to update it.`,
    }
  }
  if (info.appStatus === "outdated") {
    return {
      target: "app",
      blocking: false,
      title: "Update available",
      description: `Refine v${info.latestApp} is available. You're on v${info.app}.`,
    }
  }
  if (info.serverStatus === "outdated") {
    return {
      target: "server",
      blocking: false,
      title: "Server update available",
      description: `The server runs v${info.server}. v${LATEST_VERSIONS.server} is available.`,
    }
  }
  return null
}
