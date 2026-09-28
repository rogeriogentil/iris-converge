import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Shield } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useSignIn } from '../hooks/useSignIn'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type SignInValues = z.infer<typeof schema>

export function SignInForm() {
  const { signIn, error, isPending } = useSignIn()

  const form = useForm({
    defaultValues: { username: '', password: '' } satisfies SignInValues,
    onSubmit: async ({ value }) => {
      await signIn({ user: value.username, password: value.password })
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">iris-converge</h1>
            <p className="text-sm text-muted-foreground">Sign in to your IRIS instance</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
          noValidate
          className="space-y-4"
          aria-label="Sign in form"
        >
          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => {
              const r = schema.shape.username.safeParse(value)
              return r.success ? undefined : r.error.issues[0]?.message
            }}}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-foreground"
                >
                  Username
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  aria-required="true"
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  placeholder="Enter your IRIS username"
                />
                {field.state.meta.errors.length > 0 && (
                  <p id={`${field.name}-error`} className="text-xs text-destructive" role="alert">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => {
              const r = schema.shape.password.safeParse(value)
              return r.success ? undefined : r.error.issues[0]?.message
            }}}
          >
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? `${field.name}-error` : undefined}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  placeholder="Enter your password"
                />
                {field.state.meta.errors.length > 0 && (
                  <p id={`${field.name}-error`} className="text-xs text-destructive" role="alert">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
