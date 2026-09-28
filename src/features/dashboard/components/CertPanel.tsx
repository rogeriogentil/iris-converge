import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import type { CertExpiryAlert, PanelState } from '../types'

interface CertPanelProps {
  state: PanelState<CertExpiryAlert[]>
}

export function CertPanel({ state }: CertPanelProps) {
  if (state.status === 'loading') {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
      </div>
    )
  }
  if (state.status === 'error' || state.status === 'unavailable') {
    return (
      <p className="text-sm text-muted-foreground py-4">
        {state.status === 'unavailable' ? state.reason : state.message}
      </p>
    )
  }

  const alerts = state.data

  if (alerts.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">All certificates are valid</p>
  }

  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.credentialName}
          className="flex items-center justify-between py-1 border-b border-border last:border-0"
        >
          <p className="text-sm text-foreground truncate max-w-[60%]">{a.credentialName}</p>
          <Badge variant={a.status === 'expired' ? 'destructive' : 'secondary'} className="text-xs shrink-0">
            {a.status === 'expired'
              ? 'Expired'
              : `Expires in ${a.daysUntilExpiry}d`}
          </Badge>
        </div>
      ))}
      <div className="pt-1">
        <a href="/security/x509" className="text-xs text-primary hover:underline">
          Manage certificates →
        </a>
      </div>
    </div>
  )
}
