import { useQueries } from '@tanstack/react-query'
import { apiFetch } from '@/shared/http/client'
import { daysUntil, isExpired } from '@/shared/utils/date'
import type { DashboardStats, CertExpiryAlert, PanelState } from '../types'
import type { AuditRecord } from '@/features/audit/types'
import type { X509CredentialListItem } from '@/features/security/x509/types'

const CERT_EXPIRY_WARNING_DAYS =
  Number(import.meta.env['VITE_CERT_EXPIRY_WARNING_DAYS']) || 30

type DashboardData = {
  statsPanel: PanelState<DashboardStats>
  certPanel: PanelState<CertExpiryAlert[]>
  auditPanel: PanelState<AuditRecord[]>
}

export function useDashboardData(): DashboardData {
  const [statsQuery, certsQuery, auditQuery] = useQueries({
    queries: [
      {
        queryKey: ['dashboard', 'main'],
        queryFn: () => apiFetch<DashboardStats>('/v2/monitor/dashboard/main'),
        retry: 1,
      },
      {
        queryKey: ['dashboard', 'x509-certs'],
        queryFn: () =>
          apiFetch<{ result: X509CredentialListItem[] }>('/v2/security/x509-credentials').catch(
            () => ({ result: [] as X509CredentialListItem[] }),
          ),
        retry: false,
      },
      {
        queryKey: ['dashboard', 'recent-audit'],
        queryFn: () =>
          apiFetch<AuditRecord[]>('/v2/security/audit/records', {
            method: 'POST',
            body: JSON.stringify({
              maxRows: 20,
              BeginDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              EndDate: new Date().toISOString(),
            }),
          }).catch(() => [] as AuditRecord[]),
        retry: false,
      },
    ],
  })

  const statsPanel: PanelState<DashboardStats> = statsQuery.isPending
    ? { status: 'loading' }
    : statsQuery.isError
      ? { status: 'error', message: (statsQuery.error as { message?: string })?.message ?? 'Failed to load' }
      : { status: 'success', data: statsQuery.data }

  let certPanel: PanelState<CertExpiryAlert[]>
  if (certsQuery.isPending) {
    certPanel = { status: 'loading' }
  } else if (certsQuery.isError) {
    certPanel = { status: 'unavailable', reason: 'Certificate data unavailable' }
  } else {
    const certs = (certsQuery.data as { result?: X509CredentialListItem[] } | X509CredentialListItem[])
    const certList = Array.isArray(certs) ? certs : (certs as { result?: X509CredentialListItem[] }).result ?? []
    const alerts: CertExpiryAlert[] = certList
      .filter((c): c is X509CredentialListItem & { ValidTo: string } =>
        'ValidTo' in c && typeof c.ValidTo === 'string',
      )
      .map((c) => {
        const days = daysUntil(c.ValidTo)
        const expired = isExpired(c.ValidTo)
        return { credentialName: c.Name, daysUntilExpiry: days, status: (expired ? 'expired' : 'expiring-soon') as 'expired' | 'expiring-soon' }
      })
      .filter((a) => a.status === 'expired' || a.daysUntilExpiry <= CERT_EXPIRY_WARNING_DAYS)
    certPanel = { status: 'success', data: alerts }
  }

  const auditPanel: PanelState<AuditRecord[]> = auditQuery.isPending
    ? { status: 'loading' }
    : auditQuery.isError
      ? { status: 'unavailable', reason: 'Audit data unavailable' }
      : { status: 'success', data: auditQuery.data ?? [] }

  return { statsPanel, certPanel, auditPanel }
}
