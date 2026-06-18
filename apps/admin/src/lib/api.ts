import { getPendingToken, getToken } from "@/lib/storage"
import type {
  AdminProviderState,
  AdminSession,
  AdminToken,
  HistoryItem,
  Paginated,
  SessionModelPref,
  SetupStatus,
  Tone,
} from "@refine/schemas"

export type {
  HistoryItem,
  Paginated,
  AdminProviderState as ProviderState,
  AdminSession as Session,
  SessionModelPref,
  SetupStatus,
  AdminToken as Token,
  Tone,
}

const BASE = "/v1"

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": getPendingToken() || getToken(),
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

type AdminHistoryItem = HistoryItem & {
  deviceName: string | null
  sessionId: string
}

export const api = {
  setup: {
    status: () => request<SetupStatus>("GET", "/admin/setup"),
  },
  tokens: {
    list: () => request<AdminToken[]>("GET", "/admin/tokens"),
    create: (label: string) =>
      request<AdminToken>("POST", "/admin/tokens", { label }),
  },
  providers: {
    list: () => request<AdminProviderState[]>("GET", "/admin/providers"),
    upsert: (provider: string, apiKey: string | undefined, enabled: boolean) =>
      request<void>("PUT", `/admin/providers/${provider}`, { apiKey, enabled }),
    toggleModel: (provider: string, modelId: string, enabled: boolean) =>
      request<void>("PATCH", `/admin/providers/${provider}/models/${encodeURIComponent(modelId)}`, {
        enabled,
      }),
  },
  sessions: {
    list: () => request<AdminSession[]>("GET", "/admin/sessions"),
    expiry: (id: string, expiresAt: number | null) =>
      request<AdminSession>("PATCH", `/admin/sessions/${id}`, { expiresAt }),
    remove: (id: string) => request<void>("DELETE", `/admin/sessions/${id}`),
    listModels: (sessionId: string) =>
      request<SessionModelPref[]>("GET", `/admin/sessions/${sessionId}/models`),
    toggleModel: (sessionId: string, modelId: string, enabled: boolean) =>
      request<void>("PATCH", `/admin/sessions/${sessionId}/models/${encodeURIComponent(modelId)}`, {
        enabled,
      }),
  },
  tones: {
    list: () => request<Tone[]>("GET", "/admin/tones"),
    create: (data: { name: string; slug: string; instructions: string }) =>
      request<Tone>("POST", "/admin/tones", data),
    update: (
      id: string,
      data: Partial<{ name: string; slug: string; instructions: string }>,
    ) => request<Tone>("PUT", `/admin/tones/${id}`, data),
    remove: (id: string) => request<void>("DELETE", `/admin/tones/${id}`),
  },
  history: {
    list: (cursor?: string) =>
      request<Paginated<AdminHistoryItem>>(
        "GET",
        `/admin/history${cursor ? `?cursor=${cursor}&limit=20` : "?limit=20"}`,
      ),
    remove: (id: string) => request<void>("DELETE", `/admin/history/${id}`),
    removeAll: () => request<void>("DELETE", "/admin/history"),
  },
}
