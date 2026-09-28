import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getAccessToken } from '@/shared/http/auth-store'
import { useSession } from '@/features/auth/hooks/useSession'
import { useSignOut } from '@/features/auth/hooks/useSignOut'
import { PageLayout } from '@/shared/components/PageLayout/PageLayout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    if (!getAccessToken()) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { data: session } = useSession()
  const { signOut } = useSignOut()

  return (
    <PageLayout session={session} onSignOut={() => void signOut()}>
      <Outlet />
    </PageLayout>
  )
}
