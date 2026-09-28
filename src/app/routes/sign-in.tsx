import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { getAccessToken } from '@/shared/http/auth-store'
import { SignInForm } from '@/features/auth/components/SignInForm'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/sign-in')({
  validateSearch: searchSchema,
  beforeLoad: () => {
    if (getAccessToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: SignInPage,
})

function SignInPage() {
  return <SignInForm />
}
