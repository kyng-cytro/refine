import { getPendingToken, getToken } from "@/lib/storage"

const BASE = "/v1"

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": getToken() || getPendingToken(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export interface Token {
  id: string
  token: string
  label: string
  used: boolean
  createdAt: number
}

export interface Session {
  id: string
  deviceName: string
  createdAt: number
  pairingTokenLabel: string
}

export interface Tone {
  id: string
  name: string
  slug: string
  instructions: string
  isGlobal: boolean
  sessionId: string | null
}

export interface HistoryItem {
  id: string
  source: string
  refined: string
  modelId: string
  toneSlug: string
  createdAt: number
  deviceName: string
  sessionId: string
}

export interface Paginated<T> {
  data: T[]
  hasMore: boolean
  nextCursor: string | null
}

export interface ModelState {
  id: string
  label: string
  enabled: boolean
}

export interface ProviderState {
  provider: string
  enabled: boolean
  hasKey: boolean
  models: ModelState[]
}

export interface SessionModelPref {
  modelId: string
  enabled: boolean
}

export const api = {
  setup: {
    status: () => request<{ configured: boolean }>("GET", "/admin/setup"),
  },
  tokens: {
    list: () => request<Token[]>("GET", "/admin/tokens"),
    create: (label: string) => request<Token>("POST", "/admin/tokens", { label }),
  },
  providers: {
    list: () => request<ProviderState[]>("GET", "/admin/providers"),
    upsert: (provider: string, apiKey: string | undefined, enabled: boolean) =>
      request<void>("PUT", `/admin/providers/${provider}`, { apiKey, enabled }),
    toggleModel: (provider: string, modelId: string, enabled: boolean) =>
      request<void>("PATCH", `/admin/providers/${provider}/models/${modelId}`, { enabled }),
  },
  sessions: {
    list: () => request<Session[]>("GET", "/admin/sessions"),
    remove: (id: string) => request<void>("DELETE", `/admin/sessions/${id}`),
    listModels: (sessionId: string) =>
      request<SessionModelPref[]>("GET", `/admin/sessions/${sessionId}/models`),
    toggleModel: (sessionId: string, modelId: string, enabled: boolean) =>
      request<void>("PATCH", `/admin/sessions/${sessionId}/models/${modelId}`, { enabled }),
  },
  tones: {
    list: () => request<Tone[]>("GET", "/admin/tones"),
    create: (data: { name: string; slug: string; instructions: string }) =>
      request<Tone>("POST", "/admin/tones", data),
    update: (id: string, data: Partial<{ name: string; slug: string; instructions: string }>) =>
      request<Tone>("PUT", `/admin/tones/${id}`, data),
    remove: (id: string) => request<void>("DELETE", `/admin/tones/${id}`),
  },
  history: {
    list: (cursor?: string) =>
      request<Paginated<HistoryItem>>(
        "GET",
        `/admin/history${cursor ? `?cursor=${cursor}&limit=20` : "?limit=20"}`,
      ),
  },
}
