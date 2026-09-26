# Data Model: IRIS Management Portal

**Date**: 2026-09-26
**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

This document defines the frontend data model: TypeScript types derived from the SysAdmin API OpenAPI schemas plus portal-specific UI state types. Types are grouped by feature area. All names are PascalCase following TypeScript conventions. Field names mirror the API schema exactly to make mapping transparent.

---

## Conventions

- **DTO types** mirror the SysAdmin API schema fields exactly (PascalCase, as the API returns them).
- **UI model types** are camelCase and are derived from DTOs when a transformation is needed. They live in each feature's `types.ts`.
- **`BaseResponse<T>`** wraps all API responses: `{ result: T }`.
- **Secret fields** are never present in GET response types (per spec FR-035). A `boolean` "is-set" flag replaces them where the API follows this pattern.

---

## Shared / Base Types

```typescript
// src/types/api.ts

export type BaseResponse<T> = {
  result: T;
};

export type ApiError = {
  status: number;         // HTTP status code
  code?: string;          // IRIS error code, when available
  message: string;        // Normalised plain-language message
  detail?: string;        // Original technical message (shown on demand)
  fieldErrors?: Record<string, string>; // field name → error message
};
```

---

## Auth

```typescript
// src/features/auth/types.ts

export type LoginRequest = {
  user: string;
  password: string;
  role?: string;  // escalation role, optional
};

export type LoginResponse = {
  result: {
    access_token: string;
    refresh_token: string;
    sub: string;       // username
    iat: number;       // issued-at (Unix timestamp)
    exp: number;       // expiry (Unix timestamp)
  };
};

export type ServerInfo = {
  apiVersion: number;
  username: string;
  serverVersion: string;
  systemMode: string;   // "", "LIVE", "TEST", "DEVELOPMENT", "FAILOVER"
  product: 'iris' | 'irisforhealth' | 'healthconnect' | 'hs';
  namespaces: Array<{ name: string }>;
  privileges: Record<string, Record<string, boolean>>; // resource → { use, read, write }
};

// Portal-internal session state (not stored anywhere outside memory)
export type Session = {
  username: string;
  serverVersion: string;
  systemMode: string;
  product: string;
  privileges: ServerInfo['privileges'];
};
```

---

## Permissions — Users

```typescript
// src/features/permissions/users/types.ts

// List item (from GET /v2/security/users)
export type UserListItem = {
  Name: string;
  FullName: string;
  Enabled: boolean;
  Type: string;      // "Password user", "Delegated", etc.
  Namespace: string;
  Routine: string;
};

// Full detail (from GET /v2/security/user?user=X)
export type User = {
  AccountNeverExpires: boolean;
  AutheEnabled: number;         // bitmask
  ChangePassword: boolean;
  Comment: string;
  EmailAddress: string;
  Enabled: boolean;
  ExpirationDate: string;       // ISO date or "" / "1840-12-31"
  FullName: string;
  HOTPKeyDisplay: boolean;
  NameSpace: string;
  PasswordNeverExpires: boolean;
  PhoneNumber: string;
  PhoneProvider: string;
  Roles: string[];              // directly assigned roles
  EscalationRoles: string[];
  Routine: string;
};

// Portal UI model: effective privilege after role hierarchy traversal
export type EffectivePrivilege = {
  resourceName: string;
  permissions: string[];  // ["Read", "Write", "Use"] derived from "RWU"
  grantedBy: string[];    // role names that contribute this privilege
};
```

---

## Permissions — Roles

```typescript
// src/features/permissions/roles/types.ts

// List item (from GET /v2/security/roles)
export type RoleListItem = {
  Name: string;
  Description: string;
  CreatedBy: string;
  EscalationOnly: boolean;
};

// Full detail (from GET /v2/security/role?role=X)
export type Role = {
  Description: string;
  GrantedRoles: string[];       // roles included by this role
  EscalationOnly: boolean;
  Resources: Array<{
    Name: string;
    Permissions: string;        // e.g. "RWU" — use permissionsToLabels() to format
  }>;
};

// Portal UI model for role owner list (from GET /v2/security/role/owners)
export type RoleOwners = {
  users: string[];
};
```

---

## Permissions — Resources

```typescript
// src/features/permissions/resources/types.ts

// List item (from GET /v2/security/resources — response shape inferred as array)
export type ResourceListItem = {
  Name: string;
  Description: string;
  PublicPermission: string;
};

// Full detail (from GET /v2/security/resource?resource=X)
export type Resource = {
  Description: string;
  PublicPermission: string;
};
```

---

## Web Applications

```typescript
// src/features/web-apps/types.ts

// List item (from GET /v2/web-apps)
export type WebAppListItem = {
  Name: string;           // URL path (e.g. "/api/sysadmin")
  Enabled: boolean;
  NameSpace: string;
  Description: string;
  DispatchClass: string;  // non-empty means REST
  Type: number;           // bitmask; bit 64 = REST
};

// Full detail (from GET /v2/web-app?name=X) — mirrors Security.Applications
export type WebApp = {
  AutheEnabled: number;       // auth method bitmask
  AutoCompile: boolean;
  ChangePasswordPage: string;
  CookiePath: string;
  Description: string;
  DispatchClass: string;
  Enabled: boolean;
  GroupById: string;
  InboundWebServicesEnabled: boolean;
  IsNameSpaceDefault: boolean;
  LockCSPName: boolean;
  MatchRoles: string;
  NameSpace: string;
  PackageName: string;
  Path: string;
  Prefix: string;
  Recurse: boolean;
  Resource: string;
  SessionTimeout: number;
  Type: number;
  UseCookies: number;
  UseSessionCookie: number;
};

// Derived by the portal: whether the app is REST-type
export function isRestApp(app: Pick<WebApp, 'DispatchClass'>): boolean {
  return app.DispatchClass !== '';
}
```

---

## Security Resources — X.509 Credentials

```typescript
// src/features/security/x509/types.ts

// List item (from GET /v2/security/x509-credentials)
export type X509CredentialListItem = {
  Name: string;
};

// Full detail (from GET /v2/security/x509-credential?name=X)
export type X509Credential = {
  OwnerList: string[];
  CAFile: string;
  PeerNames: string[];
  // Private key is never returned — only existence can be inferred
};

// Certificate detail (from GET /v2/security/x509-credential/certificate?name=X)
export type X509Certificate = {
  Subject: string;
  Issuer: string;
  ValidFrom: string;   // ISO date
  ValidTo: string;     // ISO date
  // Portal computes: isExpired, daysUntilExpiry, isExpiringSoon (≤30 days)
};

// Portal UI model
export type X509CertificateStatus = 'valid' | 'expiring-soon' | 'expired';
```

---

## Security Resources — SSL Configurations

```typescript
// src/features/security/ssl/types.ts

// List item (from GET /v2/security/ssl-configurations)
export type SslConfigListItem = {
  Name: string;
};

// Full detail (from GET /v2/security/ssl-configuration?name=X)
export type SslConfig = {
  CAFile: string;
  CAPath: string;
  CertificateFile: string;
  Ciphers: string;
  Enabled: boolean;
  Name: string;
  PrivateKeyFile: string;   // path only; content never returned
  PrivateKeyPassword: boolean; // true = a password is set (content never returned)
  Type: number;             // 0=client, 1=server
  VerifyPeer: number;
  // other SSL-specific fields from SSLConfig schema
};
```

---

## Security Resources — Wallets and Secrets

```typescript
// src/features/security/wallets/types.ts

// Wallet list item (from GET /v2/wallet/collections)
export type WalletCollectionListItem = {
  Name: string;
};

// Wallet detail (from GET /v2/wallet/collection?name=X)
export type WalletCollection = {
  EditResource: string;
  UseResource: string;
};

// Secret list item (from GET /v2/wallet/secrets?collection=X)
export type WalletSecretListItem = {
  Name: string;
  Type: '%Wallet.KeyValue' | '%Wallet.SymmetricKey' | '%Wallet.RSA';
};

// Write-only: secret content is NEVER returned by the API
// The portal only confirms "a secret is configured" from the list item.
// WalletSecret write shape (PUT /v2/wallet/secret):
export type WalletSecretWrite = {
  Type: '%Wallet.KeyValue' | '%Wallet.SymmetricKey' | '%Wallet.RSA';
  WalletSecretConfig: Record<string, unknown>; // type-dependent configuration
};
```

---

## Security Resources — OAuth

```typescript
// src/features/security/oauth/types.ts

// OAuth2 Server Definitions (authorization servers the portal trusts)
export type OAuth2ServerDefinitionListItem = {
  Name: string;
  Issuer: string;
};

// OAuth2 Client Configurations (this IRIS instance as an OAuth client)
export type OAuth2ClientConfigListItem = {
  ApplicationName: string;
  ServerDefinition: string;
};

// OAuth2 Resource Servers
export type OAuth2ResourceServerListItem = {
  Name: string;
};

// Client secret is never returned — the portal shows "secret configured: yes/no"
// Full detail types mirror the API schemas; secret fields are boolean presence flags.
```

---

## Tasks

```typescript
// src/features/tasks/types.ts

// List item (from GET /v2/tasks)
export type TaskListItem = {
  ID: number;
  Name: string;
  Namespace: string;
  Enabled: boolean;
};

// Full configuration (from GET /v2/task?id=X)
export type Task = {
  Name: string;
  RunAsUser: string;
  EmailOnCompletion: string[];
  EmailOnError: string[];
  EmailOnExpiration: string[];
  EmailOutput: boolean;
  Expires: boolean;
  ExpiresDays: number;
  ExpiresHours: number;
  ExpiresMinutes: number;
  Settings: Record<string, unknown>; // task-type-specific settings
  // scheduling fields (DailyFrequency, StartTime, EndTime, etc.) from Task schema
};

// Runtime info (from GET /v2/task/info?id=X)
export type TaskInfo = {
  LastSchedule: string;
  LastStarted: string;
  LastFinished: string;
  Status: string;            // see research.md §9 for status code meanings
  Error: string;
  Type: 'System' | 'Maintenance' | 'User';
  NextScheduled: string;
  Suspended: boolean;
};

// Task status codes (from API docs)
export const TASK_STATUS = {
  SUCCESS: '1',
  RUNNING: '-1',
  UNTRAPPED_ERROR: '-2',
  SETUP_ERROR: '-3',
  TIMEOUT: '-4',
  POST_PROCESS_ERROR: '-5',
} as const;

export type TaskStatusCode = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// History entry (from GET /v2/task/history?id=X)
export type TaskHistoryEntry = {
  LastStart: string;
  Completed: string;
  Name: string;
  Status: string;
  Result: string;
  TaskId: number;
  Namespace: string;
  Routine: string;
  Pid: string;
  ErrDate: string;
  ErrNumber: number;
  Username: string;
  LogDatetime: string;
};
```

---

## System (Processes, Metrics, Devices)

```typescript
// src/features/system/types.ts

// Process list item (from GET /v2/processes)
export type ProcessListItem = {
  Pid: number;
  State: string;
  Namespace: string;
  Routine: string;
  Username: string;
  ClientIPAddress: string;
};

// Full process detail (from GET /v2/process?pid=X)
export type Process = {
  CanBeSuspended: boolean;   // read-only; portal uses this to gate actions
  CanBeTerminated: boolean;  // read-only; portal uses this to gate actions
  CanReceiveBroadcast: boolean;
  ClientExecutableName: string;
  ClientIPAddress: string;
  ClientNodeName: string;
  // additional fields from Process schema (CPU, memory, commands, etc.)
};

// Dashboard system-usage summary (from GET /v2/monitor/dashboard/main → result.SystemUsage)
export type SystemUsage = {
  DatabaseSpace: string;   // "Normal" | "Warning" | "Critical"
  DatabaseJournal: string;
  JournalSpace: string;
  JournalEntries: number;
  LockTable: string;
  WriteDaemon: string;
  Processes: number;
  CSPSessions: number;
  BusyProcesses: Array<{ Process: number; Commands: number }>;
};

// Device list item (from GET /v2/devices)
export type DeviceListItem = {
  Name: string;
  Type: string;
  SubType: string;
};
```

---

## Audit Events

```typescript
// src/features/audit/types.ts

// Audit event type (from GET /v2/security/audit/events)
export type AuditEventType = {
  Name: string;       // composite key: "EventSource/EventType/Event"
  Description: string;
  Enabled: boolean;
};

// Audit record (from POST /v2/security/audit/records — returns AsyncTask or direct result)
export type AuditRecord = {
  AuditIndex: string;
  Authentication: string;
  ClientExecutableName: string;
  ClientIPAddress: string;
  Description: string;
  Event: string;
  EventData: string;
  EventSource: string;
  EventType: string;
  JobId: number;
  JobNumber: number;
  // timestamp fields — exact field names from AsyncTaskResultListAuditRecords
  UTCTimestamp?: string;
  Timestamp?: string;
  Username?: string;
};

// Portal filter state for the audit list
export type AuditFilter = {
  eventType?: string;
  source?: string;
  username?: string;
  fromDate?: string;  // ISO date
  toDate?: string;    // ISO date
  search?: string;    // free-text search applied client-side
};
```

---

## Dashboard

```typescript
// src/features/dashboard/types.ts

// Full dashboard stats (from GET /v2/monitor/dashboard/main)
export type DashboardStats = {
  Performance: {
    Globals: number;
    Routines: number;
    PhysReads: number;
    // ... other performance counters
  };
  Status: {
    // SystemStatus fields
    DatabaseSpace: string;
    JournalSpace: string;
    // ...
  };
  SystemUsage: SystemUsage;
  Alerts: {
    // Alerts schema fields
  };
  Licensing: {
    LicensedTo: string;
    ExpirationDate: string;
    // ...
  };
  UpcomingTasks: Array<{
    Task: string;
    Time: string;
    Status: string;
  }>;
};

// Dashboard panel state — each panel loads independently
export type PanelState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
  | { status: 'unavailable'; reason: string };

// X.509 expiry alert (derived from the x509-credentials list)
export type CertExpiryAlert = {
  credentialName: string;
  daysUntilExpiry: number;
  status: 'expired' | 'expiring-soon';
};
```

---

## State Transitions

### User `Enabled` State
```
Enabled → disable action → Disabled
Disabled → enable action → Enabled
(Self-disable: warning shown before action; self-lockout check per FR-026)
```

### Task `Suspended` + `Enabled` State
```
Enabled+Active  → suspend → Enabled+Suspended  (no next run shown)
Enabled+Active  → disable → Disabled
Enabled+Suspended → resume → Enabled+Active
Enabled+Active  → run now → triggers run; status updates to Running(-1)
Running         → completes → Success(1) or Error(≤-2)
```

### Process State
```
Running → suspend (if CanBeSuspended) → Suspended
Suspended → resume → Running
Running → terminate (if CanBeTerminated) → Terminated (removed from list)
```

### SSL Config / X.509 / Wallet / OAuth
```
Absent → create → Present
Present → edit → Present (modified)
Present → delete (confirm) → Absent
```

---

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| User | Name | Required; max 50 chars; alphanumeric + underscore; unique |
| User | Password | Required on create; min 8 chars; confirmed by repeat field |
| User | EmailAddress | Optional; valid email format when present |
| User | ExpirationDate | Optional; must be future date when set |
| Role | Name | Required; max 50 chars |
| Task | Name | Required; max 50 chars; first char must be a letter |
| WalletCollection | EditResource | Required on create; format "resource:permission" |
| WalletCollection | UseResource | Required on create; format "resource:permission" |
| AuditFilter | fromDate / toDate | toDate must not precede fromDate |

Client-side validation uses Zod schemas. IRIS server-side validation errors are normalised by the HTTP client and displayed in the same field-error format.
