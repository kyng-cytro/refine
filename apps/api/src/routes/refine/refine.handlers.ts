import { isModelEnabledForSession } from "@/lib/availability"
import type { AppRouteHandler, AuthenticatedContext } from "@/lib/context"
import {
  createProviderInstance,
  getGenerationOptions,
  getModel,
} from "@/lib/models"
import { buildSystemPrompt, cleanCompletion } from "@/lib/prompt"
import * as dal from "@/routes/refine/refine.dal"
import type { Refine } from "@/routes/refine/refine.routes"
import { generateText } from "ai"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

class BadRequest extends Error {}

const resolve = async (modelId: string, toneSlug: string, sessionId: string) => {
  const config = getModel(modelId)
  if (!config) throw new BadRequest("Unknown model")
  if (!(await isModelEnabledForSession(modelId, sessionId))) {
    throw new BadRequest("Model not available on this server")
  }
  const provider = await dal.getProvider(config.provider)
  if (!provider) throw new BadRequest("Provider not configured on this server")
  const tone = await dal.resolveTone(sessionId, toneSlug)
  if (!tone) throw new BadRequest("Tone not found")
  return { config, provider, tone }
}

const computeCost = (
  cost: { input: number; output: number } | undefined,
  usage: { inputTokens?: number; outputTokens?: number } | undefined,
) => {
  if (!cost || !usage) return null
  const input = ((usage.inputTokens ?? 0) / 1e6) * cost.input
  const output = ((usage.outputTokens ?? 0) / 1e6) * cost.output
  return { input, output, total: input + output }
}

export const refine: AppRouteHandler<Refine, AuthenticatedContext> = async (
  c,
) => {
  const {
    text,
    modelId,
    toneSlug,
    save,
    private: isPrivate,
  } = c.req.valid("json")
  const { session } = c.var

  try {
    const { config, provider, tone } = await resolve(
      modelId,
      toneSlug,
      session.id,
    )
    const client = createProviderInstance(config.provider, provider.apiKey)
    const { text: raw, usage } = await generateText({
      model: client(modelId) as Parameters<typeof generateText>[0]["model"],
      system: buildSystemPrompt(tone.instructions),
      providerOptions: getGenerationOptions(modelId),
      prompt: text,
    })
    const refined = cleanCompletion(raw)
    if (!refined) throw new Error("model returned no usable text")

    const historyRow =
      save !== false
        ? await dal.saveHistory({
            sessionId: session.id,
            source: text,
            refined,
            modelId,
            toneSlug,
            isPrivate: isPrivate ?? false,
          })
        : null
    await dal.saveUsage({
      sessionId: session.id,
      historyId: historyRow?.id ?? null,
      model: { id: config.id, label: config.label, provider: config.provider },
      tone: { slug: tone.slug, name: tone.name },
      tokens: usage
        ? {
            total: usage.totalTokens ?? null,
            input: usage.inputTokens ?? null,
            output: usage.outputTokens ?? null,
          }
        : null,
      cost: computeCost(config.cost, usage),
    })
    return c.json({ refined }, HttpStatusCodes.OK)
  } catch (error) {
    if (error instanceof BadRequest) {
      return c.json({ message: error.message }, HttpStatusCodes.BAD_REQUEST)
    }
    c.var.logger.error(`[REFINE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Refinement failed",
    })
  }
}
