import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { clearTokens, getRefreshToken } from '@/shared/http/auth-store'
import { apiFetch } from '@/shared/http/client'

export function useSignOut() {
  const router = useRouter()

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) {
        await apiFetch('/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      }
    } catch {
      // Best-effort logout — clear tokens regardless
    } finally {
      clearTokens()
      await router.navigate({ to: '/sign-in' })
    }
  }, [router])

  return { signOut }
}
