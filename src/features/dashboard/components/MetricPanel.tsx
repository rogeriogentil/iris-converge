import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/utils/cn'
import type { PanelState } from '../types'
import type { SystemUsage } from '@/features/system/types'

function statusVariant(s?: string): 'default' | 'secondary' | 'destructive' {
  if (s === 'Warning') return 'secondary'
  if (s === 'Critical') return 'destructive'
  return 'default'
}

interface MetricRowProps {
  label: string
  value?: string | number
}

function MetricRow({ label, value }: MetricRowProps) {
  const strVal = value !== undefined ? String(value) : undefined
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {strVal ? (
        <Badge
          variant={statusVariant(strVal)}
          className={cn('text-xs', typeof value === 'number' && 'bg-muted text-foreground')}
        >
          {strVal}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  )
}

interface MetricPanelProps {
  state: PanelState<SystemUsage | undefined>
}

export function MetricPanel({ state }: MetricPanelProps) {
  if (state.status === 'loading') {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
      </div>
    )
  }
  if (state.status === 'error') {
    return <p className="text-sm text-destructive py-4">{state.message}</p>
  }
  if (state.status === 'unavailable' || !state.data) {
    return <p className="text-sm text-muted-foreground py-4">System metrics unavailable</p>
  }

  const u = state.data
  return (
    <div>
      <MetricRow label="Database Space" value={u.DatabaseSpace} />
      <MetricRow label="Journal Space" value={u.JournalSpace} />
      <MetricRow label="Lock Table" value={u.LockTable} />
      <MetricRow label="Write Daemon" value={u.WriteDaemon} />
      <MetricRow label="Processes" value={u.Processes} />
      <MetricRow label="CSP Sessions" value={u.CSPSessions} />
    </div>
  )
}
