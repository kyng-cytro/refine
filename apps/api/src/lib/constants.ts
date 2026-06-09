import { env } from "bun"

export const VERSION = 1
export const BASE_PATH = `/v${VERSION}`
export const HOST = env.HOST || "http://localhost:3000"
