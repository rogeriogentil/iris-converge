export type AuditEventType = {
  Name: string
  Description: string
  Enabled: boolean
}

export type AuditRecord = {
  AuditIndex: string
  Authentication?: string
  ClientExecutableName?: string
  ClientIPAddress?: string
  Description?: string
  Event?: string
  EventData?: string
  EventSource?: string
  EventType?: string
  JobId?: number
  JobNumber?: number
  UTCTimestamp?: string
  Timestamp?: string
  Username?: string
}

export type AuditFilter = {
  eventType?: string
  source?: string
  username?: string
  fromDate?: string
  toDate?: string
  search?: string
}
