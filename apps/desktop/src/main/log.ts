import { app } from "electron"

const enabled = !app.isPackaged || process.env["REFINE_DEBUG"] === "1"

export const log = (scope: string, ...args: unknown[]): void => {
  if (enabled) console.log(`[refine:${scope}]`, ...args)
}
