import { BASE_PATH, HOST } from "@/lib/constants"
import type { AppOpenAPI } from "@/lib/context"
import { SERVER_VERSION } from "@/lib/versions"
import { Scalar } from "@scalar/hono-api-reference"

export const configureOpenAPI = (app: AppOpenAPI) => {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: SERVER_VERSION,
      title: "Refine API",
      description: "Self-hostable text refinement API",
    },
    servers: [
      {
        url: HOST,
        description: "server",
      },
    ],
  })
  app.get(
    "/scalar",
    Scalar({
      url: `${BASE_PATH}/doc`,
      theme: "default",
      layout: "classic",
      favicon: "/favicon.png",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    }),
  )
}
