import { env } from "bun"
import { pinoLogger } from "hono-pino"
import pino from "pino"
import pretty from "pino-pretty"

export const logger = () => {
  return pinoLogger({
    pino: pino(
      {
        level: env.LOG_LEVEL || "info",
        redact: ["req.headers.cookie", "req.headers.authorization"],
      },
      pretty(),
    ),
  })
}
