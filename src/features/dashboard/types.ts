import type { SystemUsage } from '@/features/system/types'

export type DashboardStats = {
  Performance?: {
    Globals?: number
    Routines?: number
    PhysReads?: number
  }
  Status?: {
    DatabaseSpace?: string
    JournalSpace?: string
  }
  SystemUsage?: SystemUsage
  Alerts?: Record<string, unknown>
  Licensing?: {
    LicensedTo?: string
    ExpirationDate?: string
  }
  UpcomingTasks?: Array<{
    Task: string
    Time: string
    Status: string
  }>
}

export type PanelState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
  | { status: 'unavailable'; reason: string }

export type CertExpiryAlert = {
  credentialName: string
  daysUntilExpiry: number
  status: 'expired' | 'expiring-soon'
}
