import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { setRefreshCallback, setTokens } from '@/shared/http/auth-store'
import { apiFetch } from '@/shared/http/client'
import type { LoginRequest, LoginResponse } from '../types'

interface UseSignInResult {
  signIn: (credentials: LoginRequest) => Promise<void>
  error: string | null
  fieldErrors: Record<string, string> | null
  isPending: boolean
}

export function useSignIn(): UseSignInResult {
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const signIn = async (credentials: LoginRequest): Promise<void> => {
    setError(null)
    setFieldErrors(null)
    setIsPending(true)

    try {
      const response = await fetch(
        `${import.meta.env['VITE_SYSADMIN_API_BASE']}/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        },
      )

      if (response.status === 401) {
        setError('Invalid username or password')
        return
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null) as LoginResponse | null
        setError(
          typeof body === 'object' && body !== null && 'message' in body
            ? String((body as unknown as { message: string }).message)
            : `Sign in failed (${response.status})`,
        )
        return
      }

      const data = await response.json() as LoginResponse
      const { access_token, refresh_token, exp } = data.result
      setTokens(access_token, refresh_token, exp * 1000)

      // Wire up the proactive refresh callback
      setRefreshCallback(async () => {
        const refreshResp = await apiFetch<LoginResponse['result']>('/refresh', {
          method: 'POST',
        })
        setTokens(refreshResp.access_token, refreshResp.refresh_token, refreshResp.exp * 1000)
      })

      // Navigate to the redirect target or dashboard
      const searchParams = new URLSearchParams(window.location.search)
      const redirectTo = searchParams.get('redirect') ?? '/'
      await router.navigate({ to: redirectTo })
    } catch (err) {
      setError('Network error — check your connection to the IRIS instance')
      console.error(err)
    } finally {
      setIsPending(false)
    }
  }

  return { signIn, error, fieldErrors, isPending }
}
