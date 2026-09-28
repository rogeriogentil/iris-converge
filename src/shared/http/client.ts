import type { ApiError, BaseResponse } from '@/types/api'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './auth-store'

const API_BASE = import.meta.env['VITE_SYSADMIN_API_BASE'] as string

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

function buildUrl(path: string): string {
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

function normaliseError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object' && 'errors' in body) {
    const raw = body as { status?: number; errors: Array<{ field: string; message: string }> }
    const fieldErrors: Record<string, string> = {}
    for (const e of raw.errors) {
      fieldErrors[e.field] = e.message
    }
    return {
      status,
      message: 'Validation failed',
      fieldErrors,
    }
  }
  const msg =
    typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: unknown }).message)
      : httpStatusMessage(status)
  return { status, message: msg }
}

function httpStatusMessage(status: number): string {
  if (status === 400) return 'Bad request'
  if (status === 401) return 'Authentication required'
  if (status === 403) return 'You do not have permission to perform this action'
  if (status === 404) return 'Resource not found'
  if (status === 409) return 'Conflict — the resource was changed since you loaded it'
  if (status === 422) return 'Validation failed'
  if (status === 500) return 'Server error'
  return `Unexpected error (${status})`
}

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

async function doRefresh(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearTokens()
    throw { status: 401, message: 'Session expired' } satisfies ApiError
  }
  const resp = await fetch(buildUrl('/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!resp.ok) {
    clearTokens()
    throw normaliseError(resp.status, await resp.json().catch(() => null))
  }
  const data = (await resp.json()) as {
    result: { access_token: string; refresh_token: string; exp: number; iat: number }
  }
  const { access_token, refresh_token, exp } = data.result
  setTokens(access_token, refresh_token, exp * 1000)
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let resp: Response
  try {
    resp = await fetch(buildUrl(path), { ...options, headers })
  } catch (err) {
    throw {
      status: 0,
      message: 'Network error — check your connection to the IRIS instance',
      detail: String(err),
    } satisfies ApiError
  }

  // 401 — try token refresh once
  if (resp.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = doRefresh().finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    }
    try {
      await refreshPromise
    } catch {
      // refresh failed — caller gets a 401 ApiError and auth store is already cleared
      throw { status: 401, message: 'Session expired — please sign in again' } satisfies ApiError
    }
    const retryToken = getAccessToken()
    const retryHeaders = { ...headers, Authorization: `Bearer ${retryToken}` }
    try {
      resp = await fetch(buildUrl(path), { ...options, headers: retryHeaders })
    } catch (err) {
      throw {
        status: 0,
        message: 'Network error after token refresh',
        detail: String(err),
      } satisfies ApiError
    }
  }

  if (resp.status === 204) return undefined as T

  let body: unknown
  try {
    body = await resp.json()
  } catch {
    body = null
  }

  if (!resp.ok) {
    throw normaliseError(resp.status, body)
  }

  return (body as BaseResponse<T>).result
}
