import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatTimestamp } from '@/shared/utils/date'
import type { PanelState, DashboardStats } from '../types'

interface TaskPanelProps {
  state: PanelState<DashboardStats | undefined>
}

export function TaskPanel({ state }: TaskPanelProps) {
  if (state.status === 'loading') {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
      </div>
    )
  }
  if (state.status === 'error') {
    return <p className="text-sm text-destructive py-4">{state.message}</p>
  }
  if (state.status === 'unavailable') {
    return <p className="text-sm text-muted-foreground py-4">Task data unavailable</p>
  }

  const tasks = state.data?.UpcomingTasks ?? []

  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No upcoming tasks</p>
  }

  return (
    <div className="space-y-2">
      {tasks.slice(0, 5).map((t, i) => (
        <div key={i} className="flex items-start justify-between py-1 border-b border-border last:border-0">
          <p className="text-sm text-foreground truncate max-w-[60%]">{t.Task}</p>
          <p className="text-xs text-muted-foreground shrink-0 ml-2">
            {t.Time ? formatTimestamp(t.Time) : '—'}
          </p>
        </div>
      ))}
      <div className="pt-1">
        <a href="/tasks" className="text-xs text-primary hover:underline">
          View all tasks →
        </a>
      </div>
    </div>
  )
}
