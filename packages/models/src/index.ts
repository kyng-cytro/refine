import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { icons } from "./icons"
import type { Model, ModelProvider, Provider } from "./types"

export type { Model, ModelProvider, Provider } from "./types"

export const PROVIDERS: Provider[] = [
  {
    id: "openrouter",
    label: "OpenRouter",
    description: "300+ models including free options",
    placeholder: "sk-or-…",
    docs: "https://openrouter.ai/keys",
    icon: icons.openrouter,
    create: (apiKey) => createOpenRouter({ apiKey }),
    models: [
      {
        id: "openrouter/free",
        label: "Auto (Free)",
        free: true,
        icon: icons.openrouter,
        cost: { input: 0, output: 0 },
      },
      {
        id: "openai/gpt-oss-20b:free",
        label: "GPT-OSS 20B",
        free: true,
        icon: icons.openai,
        cost: { input: 0, output: 0 },
      },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "GPT-5.4 Mini and GPT-5.4 Nano",
    placeholder: "sk-…",
    docs: "https://platform.openai.com/api-keys",
    icon: icons.openai,
    create: (apiKey) => createOpenAI({ apiKey }),
    models: [
      {
        id: "gpt-5.4-mini",
        label: "GPT-5.4 Mini",
        cost: { input: 0.75, output: 4.5 },
      },
      {
        id: "gpt-5.4-nano",
        label: "GPT-5.4 Nano",
        cost: { input: 0.2, output: 1.25 },
      },
    ],
  },
  {
    id: "anthropic",
    label: "Anthropic",
    description: "Claude Haiku 4.5",
    placeholder: "sk-ant-…",
    docs: "https://console.anthropic.com/settings/keys",
    icon: icons.anthropic,
    create: (apiKey) => createAnthropic({ apiKey }),
    models: [
      {
        id: "claude-haiku-4-5",
        label: "Claude Haiku 4.5",
        cost: { input: 1, output: 5 },
      },
    ],
  },
  {
    id: "google",
    label: "Google",
    description: "Gemini 3.1 Flash Lite and Gemini 2.5 Flash Lite",
    placeholder: "AIza…",
    docs: "https://aistudio.google.com/app/apikey",
    icon: icons.google,
    create: (apiKey) => createGoogleGenerativeAI({ apiKey }),
    models: [
      {
        id: "gemini-3.1-flash-lite",
        label: "Gemini 3.1 Flash Lite",
        cost: { input: 0.25, output: 1.5 },
      },
      {
        id: "gemini-2.5-flash-lite",
        label: "Gemini 2.5 Flash Lite",
        cost: { input: 0.1, output: 0.4 },
      },
    ],
  },
]

export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id)
}

export function getModels(): Array<Model & { provider: ModelProvider }> {
  return PROVIDERS.flatMap((p) =>
    p.models.map((m) => ({ ...m, provider: p.id })),
  )
}

export function getModel(
  id: string,
): (Model & { provider: ModelProvider }) | undefined {
  return getModels().find((m) => m.id === id)
}

export function createProviderInstance(providerId: string, apiKey: string) {
  const p = getProvider(providerId)
  if (!p) throw new Error(`Unknown provider: ${providerId}`)
  return p.create(apiKey)
}
