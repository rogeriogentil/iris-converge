import { afterEach, describe, expect, it } from 'vitest'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../auth-store'

afterEach(() => {
  clearTokens()
})

describe('auth-store', () => {
  it('stores access token in memory', () => {
    setTokens('access-1', 'refresh-1', Date.now() + 3_600_000)
    expect(getAccessToken()).toBe('access-1')
  })

  it('stores refresh token in sessionStorage', () => {
    setTokens('access-1', 'refresh-1', Date.now() + 3_600_000)
    expect(getRefreshToken()).toBe('refresh-1')
  })

  it('returns null for access token before setTokens', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('clears access token on clearTokens', () => {
    setTokens('access-1', 'refresh-1', Date.now() + 3_600_000)
    clearTokens()
    expect(getAccessToken()).toBeNull()
  })

  it('clears refresh token from sessionStorage on clearTokens', () => {
    setTokens('access-1', 'refresh-1', Date.now() + 3_600_000)
    clearTokens()
    expect(getRefreshToken()).toBeNull()
  })

  it('overwrites previous tokens on subsequent setTokens', () => {
    setTokens('access-1', 'refresh-1', Date.now() + 3_600_000)
    setTokens('access-2', 'refresh-2', Date.now() + 3_600_000)
    expect(getAccessToken()).toBe('access-2')
    expect(getRefreshToken()).toBe('refresh-2')
  })
})
