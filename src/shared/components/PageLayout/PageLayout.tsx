import { useState, type ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Shield,
  Globe,
  Lock,
  CalendarClock,
  Monitor,
  FileText,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/shared/components/ui/sheet'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/utils/cn'
import type { Session } from '@/features/auth/types'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Permissions', href: '/permissions/users', icon: Shield },
  { label: 'Web Applications', href: '/web-apps', icon: Globe },
  { label: 'Security Resources', href: '/security/x509', icon: Lock },
  { label: 'Tasks', href: '/tasks', icon: CalendarClock },
  { label: 'System', href: '/system', icon: Monitor },
  { label: 'Audit Events', href: '/audit', icon: FileText },
]

interface PageLayoutProps {
  children: ReactNode
  session?: Session
  onSignOut?: () => void
}

function NavLinks({ onNav }: { onNav?: () => void }) {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <nav aria-label="Main navigation">
      <ul className="space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/'
              ? currentPath === '/'
              : currentPath.startsWith(href)

          return (
            <li key={href}>
              <Link
                to={href}
                onClick={onNav}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function SidebarContent({ session, onSignOut, onNav }: { session?: Session; onSignOut?: () => void; onNav?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-2 px-1 py-1">
        <Shield className="h-5 w-5 text-sidebar-primary" aria-hidden="true" />
        <span className="text-sm font-semibold text-sidebar-foreground">iris-converge</span>
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="flex-1 overflow-y-auto">
        <NavLinks onNav={onNav} />
      </div>
      {session && (
        <>
          <Separator className="bg-sidebar-border" />
          <div className="flex flex-col gap-2 px-1">
            <div>
              <p className="text-xs font-medium text-sidebar-foreground">{session.username}</p>
              <p className="text-xs text-muted-foreground truncate">{session.serverVersion}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground"
              onClick={onSignOut}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export function PageLayout({ children, session, onSignOut }: PageLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-56 xl:w-64 shrink-0 border-r border-sidebar-border bg-sidebar"
        aria-label="Sidebar"
      >
        <SidebarContent session={session} onSignOut={onSignOut} />
      </aside>

      {/* Mobile nav */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-3 left-3 z-50"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent
            session={session}
            onSignOut={onSignOut}
            onNav={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:pl-0 pl-0">
        <div className="lg:hidden h-14" aria-hidden="true" />
        {children}
      </main>
    </div>
  )
}
