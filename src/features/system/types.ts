export type ProcessListItem = {
  Pid: number
  State: string
  Namespace: string
  Routine: string
  Username: string
  ClientIPAddress: string
}

export type Process = {
  Pid?: number
  State?: string
  Namespace?: string
  Routine?: string
  Username?: string
  ClientIPAddress?: string
  ClientNodeName?: string
  ClientExecutableName?: string
  CanBeSuspended: boolean
  CanBeTerminated: boolean
  CanReceiveBroadcast?: boolean
}

export type SystemUsage = {
  DatabaseSpace?: string
  DatabaseJournal?: string
  JournalSpace?: string
  JournalEntries?: number
  LockTable?: string
  WriteDaemon?: string
  Processes?: number
  CSPSessions?: number
  BusyProcesses?: Array<{ Process: number; Commands: number }>
}

export type DeviceListItem = {
  Name: string
  Type: string
  SubType: string
}
