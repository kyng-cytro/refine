const KEY = "refine_admin_token"
const PENDING_KEY = "refine_admin_token_pending"

export const getToken = () => localStorage.getItem(KEY) ?? ""
export const setToken = (token: string) => localStorage.setItem(KEY, token)
export const clearToken = () => localStorage.removeItem(KEY)

// Holds the validated token during the wizard; committed on completion
export const setPendingToken = (token: string) => localStorage.setItem(PENDING_KEY, token)
export const getPendingToken = () => localStorage.getItem(PENDING_KEY) ?? ""
export const commitPendingToken = () => {
  const t = getPendingToken()
  if (t) setToken(t)
  localStorage.removeItem(PENDING_KEY)
}
export const clearPendingToken = () => localStorage.removeItem(PENDING_KEY)
