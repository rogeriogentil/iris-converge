import { createFileRoute } from '@tanstack/react-router'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { MetricPanel } from '@/features/dashboard/components/MetricPanel'
import { TaskPanel } from '@/features/dashboard/components/TaskPanel'
import { AuditPanel } from '@/features/dashboard/components/AuditPanel'
import { CertPanel } from '@/features/dashboard/components/CertPanel'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  )
}

function DashboardPage() {
  const { statsPanel, certPanel, auditPanel } = useDashboardData()

  const systemUsagePanel =
    statsPanel.status === 'success'
      ? { status: 'success' as const, data: statsPanel.data?.SystemUsage }
      : statsPanel

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">IRIS instance health overview</p>
      </header>

      {statsPanel.status === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      )}

      {statsPanel.status !== 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PanelCard title="System Resources">
            <MetricPanel state={systemUsagePanel} />
          </PanelCard>

          <PanelCard title="Upcoming Tasks">
            <TaskPanel state={statsPanel} />
          </PanelCard>

          <PanelCard title="Recent Audit Events">
            <AuditPanel state={auditPanel} />
          </PanelCard>

          <PanelCard title="Certificate Expiry">
            <CertPanel state={certPanel} />
          </PanelCard>
        </div>
      )}
    </div>
  )
}
