import type {
  CreateTone,
  HistoryQuery,
  HistoryResponse,
  PairRequest,
  PairResponse,
  ProvidersResponse,
  RefineRequest,
  RefineResponse,
  SessionInfo,
  Tone,
  UpdateTone,
} from "@refine/schemas"
import { $fetch } from "ofetch"

export type ClientOptions = {
  baseURL: string
  sessionToken?: string
}

export const createClient = (options: ClientOptions) => {
  const apiFetch = $fetch.create({
    baseURL: options.baseURL,
    headers: options.sessionToken
      ? { Authorization: `Bearer ${options.sessionToken}` }
      : {},
  })

  return {
    auth: {
      pair: (body: PairRequest) =>
        apiFetch<PairResponse>("/v1/auth/pair", { method: "POST", body }),
      me: () => apiFetch<SessionInfo>("/v1/auth/me"),
    },

    refine: (body: RefineRequest) =>
      apiFetch<RefineResponse>("/v1/refine", { method: "POST", body }),

    history: {
      list: (query?: Partial<HistoryQuery>) =>
        apiFetch<HistoryResponse>("/v1/history", { query }),
      delete: (id: string) =>
        apiFetch(`/v1/history/${id}`, { method: "DELETE" }),
    },

    tones: {
      list: () => apiFetch<Tone[]>("/v1/tones"),
      create: (body: CreateTone) =>
        apiFetch<Tone>("/v1/tones", { method: "POST", body }),
      update: (id: string, body: UpdateTone) =>
        apiFetch<Tone>(`/v1/tones/${id}`, { method: "PUT", body }),
      delete: (id: string) => apiFetch(`/v1/tones/${id}`, { method: "DELETE" }),
    },

    providers: {
      list: () => apiFetch<ProvidersResponse>("/v1/providers"),
    },
  }
}

export type RefineClient = ReturnType<typeof createClient>
