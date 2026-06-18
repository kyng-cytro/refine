import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { icons } from "./icons"
import type { Model, ModelProvider, Provider } from "./types"

export type { ModelProvider, Model, Provider } from "./types"

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
        id: "meta-llama/llama-3.3-70b-instruct:free",
        label: "Llama 3.3 70B",
        free: true,
        icon: icons.meta,
      },
      {
        id: "google/gemma-3-12b-it:free",
        label: "Gemma 3 12B",
        free: true,
        icon: icons.google,
      },
      {
        id: "mistralai/mistral-7b-instruct:free",
        label: "Mistral 7B",
        free: true,
        icon: icons.mistralai,
      },
      {
        id: "microsoft/phi-3-mini-128k-instruct:free",
        label: "Phi-3 Mini",
        free: true,
      },
      {
        id: "qwen/qwen-2.5-7b-instruct:free",
        label: "Qwen 2.5 7B",
        free: true,
        icon: icons.qwen,
      },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "GPT-4o and GPT-4o mini",
    placeholder: "sk-…",
    docs: "https://platform.openai.com/api-keys",
    icon: icons.openai,
    create: (apiKey) => createOpenAI({ apiKey }),
    models: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
    ],
  },
  {
    id: "anthropic",
    label: "Anthropic",
    description: "Claude 3.5 Sonnet and Claude Haiku 3.5",
    placeholder: "sk-ant-…",
    docs: "https://console.anthropic.com/settings/keys",
    icon: icons.anthropic,
    create: (apiKey) => createAnthropic({ apiKey }),
    models: [
      { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
      { id: "claude-haiku-3-5", label: "Claude Haiku 3.5" },
    ],
  },
  {
    id: "google",
    label: "Google",
    description: "Gemini 2.0 Flash and Gemini 2.0 Flash Lite",
    placeholder: "AIza…",
    docs: "https://aistudio.google.com/app/apikey",
    icon: icons.google,
    create: (apiKey) => createGoogleGenerativeAI({ apiKey }),
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
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
