const REFRESH_TOKEN_KEY = 'iris_converge_refresh_token'

let accessToken: string | null = null
let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null

export function setTokens(access: string, refresh: string, expiryMs: number): void {
  accessToken = access
  try {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  } catch {
    // sessionStorage unavailable (private browsing) — session will not persist across tabs
  }
  scheduleRefresh(expiryMs)
}

export function getAccessToken(): string | null {
  return accessToken
}

export function getRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearTokens(): void {
  accessToken = null
  if (refreshTimeoutId !== null) {
    clearTimeout(refreshTimeoutId)
    refreshTimeoutId = null
  }
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // ignore
  }
}

// onRefreshNeeded is set by the HTTP client to trigger a proactive token refresh
let refreshCallback: (() => Promise<void>) | null = null

export function setRefreshCallback(cb: () => Promise<void>): void {
  refreshCallback = cb
}

function scheduleRefresh(expiryMs: number): void {
  if (refreshTimeoutId !== null) clearTimeout(refreshTimeoutId)

  // Refresh 60 seconds before expiry; minimum 5 seconds
  const delay = Math.max(expiryMs - Date.now() - 60_000, 5_000)
  refreshTimeoutId = setTimeout(() => {
    refreshCallback?.().catch(() => {
      // Proactive refresh failed — the next authenticated request will trigger a reactive refresh
    })
  }, delay)
}
