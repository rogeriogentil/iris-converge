import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatTimestamp } from '@/shared/utils/date'
import type { PanelState } from '../types'
import type { AuditRecord } from '@/features/audit/types'

interface AuditPanelProps {
  state: PanelState<AuditRecord[]>
}

export function AuditPanel({ state }: AuditPanelProps) {
  if (state.status === 'loading') {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
      </div>
    )
  }
  if (state.status === 'error' || state.status === 'unavailable') {
    const msg = state.status === 'error' ? state.message : state.reason
    return <p className="text-sm text-muted-foreground py-4">{msg}</p>
  }

  const records = state.data

  if (records.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No recent audit events</p>
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground pb-1">
        {records.length} event{records.length !== 1 ? 's' : ''} in the last 24 h
      </p>
      {records.slice(0, 5).map((r, i) => (
        <div key={i} className="flex items-start justify-between py-1 border-b border-border last:border-0">
          <div>
            <p className="text-sm text-foreground">
              {r.Event ?? r.EventType ?? 'Event'}
            </p>
            {r.Username && (
              <p className="text-xs text-muted-foreground">{r.Username}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground shrink-0 ml-2">
            {r.UTCTimestamp ? formatTimestamp(r.UTCTimestamp) : r.Timestamp ? formatTimestamp(r.Timestamp) : '—'}
          </p>
        </div>
      ))}
      <div className="pt-1">
        <a href="/audit" className="text-xs text-primary hover:underline">
          View all events →
        </a>
      </div>
    </div>
  )
}
