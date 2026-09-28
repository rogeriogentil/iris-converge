import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearTokens, setTokens } from '../auth-store'

// Mock fetch
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

// Reset import.meta.env
vi.stubEnv('VITE_SYSADMIN_API_BASE', 'http://iris.local/api/sysadmin')

// Import after stubbing env
const { apiFetch } = await import('../client')

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  clearTokens()
})

afterEach(() => {
  clearTokens()
})

describe('apiFetch', () => {
  it('unwraps result envelope on 200', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: { id: 42 } }))
    const data = await apiFetch<{ id: number }>('/v2/test')
    expect(data).toEqual({ id: 42 })
  })

  it('attaches Authorization header when token is set', async () => {
    setTokens('my-token', 'my-refresh', Date.now() + 3_600_000)
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: {} }))
    await apiFetch('/v2/test')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    )
  })

  it('throws ApiError with fieldErrors on 400 validation response', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ errors: [{ field: 'Name', message: 'Required' }] }, 400),
    )
    await expect(apiFetch('/v2/test')).rejects.toMatchObject({
      status: 400,
      fieldErrors: { Name: 'Required' },
    })
  })

  it('throws ApiError with status 403 on forbidden', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Forbidden' }, 403))
    await expect(apiFetch('/v2/test')).rejects.toMatchObject({ status: 403 })
  })

  it('throws ApiError with status 404 on not found', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 404))
    await expect(apiFetch('/v2/test')).rejects.toMatchObject({ status: 404 })
  })

  it('throws ApiError with status 500 on server error', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500))
    await expect(apiFetch('/v2/test')).rejects.toMatchObject({ status: 500 })
  })

  it('throws network error on fetch failure', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(apiFetch('/v2/test')).rejects.toMatchObject({ status: 0 })
  })
})
