# Tasks: IRIS Management Portal

**Input**: Design documents from `specs/001-iris-management-portal/`

**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md) · [research.md](research.md) · [data-model.md](data-model.md) · [contracts/](contracts/)

**Tests**: Unit tests are included for the shared HTTP client and utility functions (high-risk, shared code per plan.md §Testing Strategy). No per-story test suites are generated; story-level validation uses the [quickstart.md](quickstart.md) scenarios. Playwright E2E tests are in the Polish phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and delivery.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (touches different files)
- **[Story]**: User story this task belongs to (US1–US8)
- All paths are relative to the repository root

---

## Phase 1: Setup (Project Scaffolding)

**Purpose**: Initialize the project with the exact stack from [plan.md](plan.md). All tasks in this phase must complete before Phase 2.

- [ ] T001 Scaffold Vite 6 + React 19 + TypeScript 5 project at repo root: `npm create vite@latest . -- --template react-ts`
- [ ] T002 Install TanStack packages: `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/react-table`, `@tanstack/react-form` in `package.json`
- [ ] T003 [P] Install Zod, Lucide React, `i18next`, `react-i18next`, `i18next-browser-languagedetector` in `package.json`
- [ ] T004 [P] Install and configure Tailwind CSS v4: `tailwind.css` with `@import "tailwindcss"`, update `vite.config.ts` with `@tailwindcss/vite` plugin
- [ ] T005 [P] Initialise shadcn/ui for Tailwind v4: run `npx shadcn@latest init`, configure `components.json`
- [ ] T006 [P] Configure ESLint with `eslint-plugin-jsx-a11y` and `@typescript-eslint/eslint-plugin`; create `.eslintrc.cjs`
- [ ] T007 [P] Configure Vitest: add `vitest.config.ts`, install `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`
- [ ] T008 [P] Configure Playwright: run `npm init playwright@latest`; set base URL to `http://localhost:5173` in `playwright.config.ts`
- [ ] T009 Create `.env`, `.env.development`, `.env.production` files per [contracts/config.md](contracts/config.md); add `.env.local` to `.gitignore`
- [ ] T010 Create full directory tree per plan.md §Project Structure: `src/app/`, `src/features/`, `src/shared/`, `src/types/`, `iris/src/IrisConverge/`
- [ ] T011 [P] Configure TanStack Router file-based routes: add `@tanstack/router-vite-plugin` to `vite.config.ts`; create `src/app/router.tsx` skeleton
- [ ] T012 [P] Add `ipm.json` IPM package manifest at `iris/ipm.json` per [contracts/config.md](contracts/config.md)

**Checkpoint**: `npm run dev` starts without errors; project tree matches plan.md.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that every user story depends on. All tasks here must complete before any Phase 3+ work begins.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [ ] T013 Define `BaseResponse<T>` and `ApiError` types in `src/types/api.ts`
- [ ] T014 Implement auth token store in `src/shared/http/auth-store.ts`: access token in module variable; refresh token in `sessionStorage`; `setTokens()`, `getAccessToken()`, `getRefreshToken()`, `clearTokens()`, proactive refresh scheduling via `setTimeout`
- [ ] T015 Implement shared HTTP client in `src/shared/http/client.ts`: `apiFetch(path, options)` wraps `fetch`; attaches `Authorization: Bearer`; unwraps `{ result }` envelope; normalises 4xx/5xx into `ApiError`; handles 401 → calls `POST /refresh` once then retries; handles network errors
- [ ] T016 Implement async-polling helper in `src/shared/http/async-poll.ts`: polls `GET /v2/async-result?id=X` every 2 s; resolves on `status === "complete"`; rejects on `status === "error"`; supports cancel
- [ ] T017 [P] Unit test HTTP client error normalisation in `src/shared/http/__tests__/client.test.ts`: 400 field errors, 401 refresh retry, 403 permission, 404 not-found, 500 server error, network failure
- [ ] T018 [P] Unit test auth-store token lifecycle in `src/shared/http/__tests__/auth-store.test.ts`: setTokens, getAccessToken, clearTokens, sessionStorage persistence
- [ ] T019 Implement `src/shared/utils/permissions.ts`: `permissionsToLabels(s: string): string[]` maps `"RWU"` → `["Read","Write","Use"]`; `traverseRoleHierarchy(rootRoles, roleMap)` returns flat `EffectivePrivilege[]` with cycle detection
- [ ] T020 [P] Unit test `src/shared/utils/permissions.ts`: single role, nested roles, cyclic roles, all permission combinations
- [ ] T021 [P] Implement `src/shared/utils/schedule.ts`: `scheduleToHuman(task: Task): string` converts task schedule fields to plain language ("Daily at 02:00", "Every Monday at 03:00", "Once on 2027-01-15")
- [ ] T022 [P] Unit test `src/shared/utils/schedule.ts`: daily, weekly, monthly, one-time, and disabled schedule variants
- [ ] T023 [P] Implement `src/shared/utils/date.ts`: `formatTimestamp(iso: string): string` formats to "Sep 26, 2026 17:30 UTC+3" (timezone-aware); `daysUntil(iso: string): number`; `isExpired(iso: string): boolean`
- [ ] T024 Create `src/shared/components/PageLayout/PageLayout.tsx`: shell with persistent sidebar on desktop (collapsible), drawer on mobile (`Sheet` from shadcn/ui); `NavItem` list driven by [contracts/routes.md](contracts/routes.md) nav labels; highlights active route via TanStack Router
- [ ] T025 [P] Add shadcn/ui components used across all features: `Button`, `Dialog`, `AlertDialog`, `Sheet`, `Badge`, `Skeleton`, `Separator`, `Tooltip`, `Toast` (`Sonner`) via `npx shadcn@latest add`
- [ ] T026 [P] Create `src/shared/components/ConfirmDialog/ConfirmDialog.tsx`: wraps `AlertDialog`; props: `title`, `description`, `consequence`, `onConfirm`, `onCancel`; initial focus on cancel button (FR-069)
- [ ] T027 [P] Create `src/shared/components/DataTable/DataTable.tsx`: wraps TanStack Table; supports sorting, column visibility, pagination; `EmptyState` slot for no-results and no-data-exists states
- [ ] T028 [P] Create `src/shared/components/EmptyState/EmptyState.tsx` and `src/shared/components/ErrorState/ErrorState.tsx`: props: `title`, `description`, optional `action` (label + onClick); covers all states in FR-058
- [ ] T029 Set up i18next in `src/shared/i18n/index.ts`: `languageDetector` with `en` fallback; synchronous JSON bundle loading; create empty namespace files under `src/shared/i18n/locales/en/` (navigation.json, common.json, errors.json)
- [ ] T030 Create `src/app/providers.tsx`: wraps app in `QueryClientProvider`, `I18nextProvider`, React Router `RouterProvider`, and a global `ErrorBoundary` class component that logs via a shared `logger` utility and renders a recovery screen
- [ ] T031 [P] Implement `src/shared/utils/logger.ts`: thin wrapper over `console`; can be swapped in tests
- [ ] T032 Wire up `src/app/main.tsx`: mount `<Providers />` onto `#root`; configure `QueryClient` with defaults (staleTime 30 s, retry 1)

**Checkpoint**: `npm test` passes for HTTP client and utility unit tests. `npm run dev` renders the shell with sidebar and no route content.

---

## Phase 3: User Story 1 — Sign In and Dashboard (Priority: P1) 🎯 MVP

**Goal**: User can authenticate with IRIS credentials, land on a dashboard showing system health summary, and navigate between all portal areas.

**Independent Test**: See [quickstart.md §S1 and §S2](quickstart.md).

- [ ] T033 [US1] Define auth types in `src/features/auth/types.ts`: `LoginRequest`, `LoginResponse`, `ServerInfo`, `Session` (from [data-model.md §Auth](data-model.md))
- [ ] T034 [US1] Implement `useSignIn` hook in `src/features/auth/hooks/useSignIn.ts`: calls `POST /login`; stores tokens via auth-store; returns `session` state; handles invalid-credentials 401 as form error
- [ ] T035 [P] [US1] Implement `useSignOut` hook in `src/features/auth/hooks/useSignOut.ts`: calls `POST /logout` with refresh token; clears tokens; redirects to `/sign-in`
- [ ] T036 [P] [US1] Implement `useSession` hook in `src/features/auth/hooks/useSession.ts`: calls `GET /info` via TanStack Query; returns `Session`; used by header and dashboard
- [ ] T037 [US1] Create `src/features/auth/components/SignInForm.tsx`: controlled form with username + password fields; Zod validation (both required); submit calls `useSignIn`; field-level errors; loading state on submit; no password-reveal by default (FR-036)
- [ ] T038 [US1] Create sign-in route `src/features/auth/routes/sign-in.tsx` at path `/sign-in`; unauthenticated entry point; redirects to `?redirect` target on success
- [ ] T039 [US1] Add TanStack Router auth guard in `src/app/router.tsx`: `beforeLoad` checks `getAccessToken()`; redirects to `/sign-in?redirect=<current>` if absent
- [ ] T040 [P] [US1] Define dashboard types in `src/features/dashboard/types.ts`: `DashboardStats`, `PanelState<T>`, `CertExpiryAlert` (from [data-model.md §Dashboard](data-model.md))
- [ ] T041 [US1] Implement `useDashboardData` hook in `src/features/dashboard/hooks/useDashboardData.ts`: `useQueries` for three independent queries — `GET /v2/monitor/dashboard/main`, `POST /v2/security/audit/records` (last 24 h, max 20), `GET /v2/security/x509-credentials`; each query returns `PanelState<T>`
- [ ] T042 [P] [US1] Create `src/features/dashboard/components/MetricPanel.tsx`: displays system usage (DatabaseSpace, JournalSpace, LockTable, WriteDaemon, Processes, CSPSessions) from `SystemUsage`; status badge per value ("Normal"/"Warning"/"Critical")
- [ ] T043 [P] [US1] Create `src/features/dashboard/components/TaskPanel.tsx`: displays upcoming tasks from `MainDashboardStats.UpcomingTasks`; links to Tasks area
- [ ] T044 [P] [US1] Create `src/features/dashboard/components/AuditPanel.tsx`: shows recent audit event count and last few records; links to Audit Events area
- [ ] T045 [P] [US1] Create `src/features/dashboard/components/CertPanel.tsx`: lists X.509 credentials; flags expired/expiring-soon using `daysUntil()` and `isExpired()` from date utils; links to Security Resources
- [ ] T046 [US1] Create dashboard route `src/features/dashboard/routes/index.tsx` at path `/`: renders four panels via `useDashboardData`; each panel independently shows loading skeleton, data, error, or unavailable state (FR-017)
- [ ] T047 [P] [US1] Add session info to `PageLayout` header: signed-in username and IRIS version from `useSession` (FR-003); sign-out button calls `useSignOut`
- [ ] T048 [P] [US1] Add i18n translations for auth and dashboard in `src/shared/i18n/locales/en/auth.json` and `src/shared/i18n/locales/en/dashboard.json`

**Checkpoint**: Sign in, see dashboard with at least one live data panel. Quickstart S1 and S2 pass.

---

## Phase 4: User Story 2 — Permission Management (Priority: P1)

**Goal**: Administrator can inspect user–role–resource relationships and perform full CRUD on users and roles.

**Independent Test**: See [quickstart.md §S3 and §S4](quickstart.md).

- [ ] T049 [US2] Define permission types in `src/features/permissions/users/types.ts`, `src/features/permissions/roles/types.ts`, `src/features/permissions/resources/types.ts` (from [data-model.md §Permissions](data-model.md))
- [ ] T050 [P] [US2] Implement user API hooks in `src/features/permissions/users/hooks/useUsers.ts` and `useUser.ts`: `GET /v2/security/users` (list) and `GET /v2/security/user` (detail) via TanStack Query; `useCreateUser`, `useUpdateUser`, `useDeleteUser` mutations
- [ ] T051 [P] [US2] Implement role API hooks in `src/features/permissions/roles/hooks/useRoles.ts`, `useRole.ts`, `useRoleOwners.ts`: `GET /v2/security/roles`, `GET /v2/security/role`, `GET /v2/security/role/owners`; `useCreateRole`, `useUpdateRole`, `useDeleteRole` mutations
- [ ] T052 [P] [US2] Implement resource API hooks in `src/features/permissions/resources/hooks/useResources.ts`, `useResource.ts`: `GET /v2/security/resources`, `GET /v2/security/resource`
- [ ] T053 [US2] Implement `useEffectivePrivileges(username)` hook in `src/features/permissions/users/hooks/useEffectivePrivileges.ts`: fetches user → roles → nested roles via `useQueries`; calls `traverseRoleHierarchy` from `src/shared/utils/permissions.ts`; memoises result
- [ ] T054 [US2] Create user list route `src/features/permissions/users/routes/users.tsx` at `/permissions/users`: `DataTable` with columns (Name, FullName, Enabled badge, Type); search by `q`; enabled filter; links to user detail
- [ ] T055 [P] [US2] Create user detail route `src/features/permissions/users/routes/user-detail.tsx` at `/permissions/users/$username`: shows all `User` fields; "Assigned Roles" section (each role links to role detail); "Effective Privileges" section built from `useEffectivePrivileges`; Edit and Delete buttons
- [ ] T056 [P] [US2] Create user create/edit form `src/features/permissions/users/components/UserForm.tsx`: TanStack Form + Zod schema (Name required ≤50 chars, Password required on create ≥8 chars with confirm, EmailAddress valid format, ExpirationDate future); field-level errors; self-lockout warning if editing own account (FR-026)
- [ ] T057 [P] [US2] Create user create route `/permissions/users/new` and edit route `/permissions/users/$username/edit` using `UserForm`; on save invalidate `useUsers` query
- [ ] T058 [P] [US2] Wire user delete button to `ConfirmDialog`: title = "Delete user [Name]"; consequence = "This user will lose all access. This cannot be undone."; check role assignments and mention count (FR-068); initial focus on cancel
- [ ] T059 [US2] Create role list route `src/features/permissions/roles/routes/roles.tsx` at `/permissions/roles`: `DataTable` with columns (Name, Description, CreatedBy, EscalationOnly badge); search
- [ ] T060 [P] [US2] Create role detail route `src/features/permissions/roles/routes/role-detail.tsx` at `/permissions/roles/$roleName`: shows Description, GrantedRoles, Resources (with `permissionsToLabels`), and owners from `useRoleOwners`; Edit and Delete buttons; system roles (CreatedBy `_SYSTEM`) show delete as disabled with tooltip
- [ ] T061 [P] [US2] Create role create/edit form `src/features/permissions/roles/components/RoleForm.tsx`: TanStack Form + Zod (Name required, Description); resource grant rows (resource picker + permission checkboxes R/W/U); included roles multi-select
- [ ] T062 [P] [US2] Create role create route `/permissions/roles/new` and edit route `/permissions/roles/$roleName/edit`; on save invalidate `useRoles`
- [ ] T063 [P] [US2] Wire role delete button to `ConfirmDialog`: mention count of owners from `useRoleOwners` in consequence text (FR-068)
- [ ] T064 [P] [US2] Create resource list route `src/features/permissions/resources/routes/resources.tsx` at `/permissions/resources`: `DataTable` with columns (Name, Description, PublicPermission); search
- [ ] T065 [P] [US2] Create resource detail route `src/features/permissions/resources/routes/resource-detail.tsx` at `/permissions/resources/$resourceName`: shows Description and PublicPermission; lists roles that include this resource (derived by scanning role data already cached)
- [ ] T066 [P] [US2] Add i18n translations in `src/shared/i18n/locales/en/permissions.json`

**Checkpoint**: Create a role, assign it to a user, verify effective privileges show the source role. Quickstart S3 and S4 pass.

---

## Phase 5: User Story 3 — Web Application Management (Priority: P2)

**Goal**: Developer can list, inspect, create, update, enable/disable, and delete web applications; REST apps show their endpoint configuration.

**Independent Test**: See [quickstart.md](quickstart.md) — create REST web app, disable/re-enable, delete.

- [ ] T067 [US3] Define web app types in `src/features/web-apps/types.ts` (from [data-model.md §Web Applications](data-model.md)); add `isRestApp()` helper
- [ ] T068 [US3] Implement web app API hooks in `src/features/web-apps/hooks/useWebApps.ts` and `useWebApp.ts`: `GET /v2/web-apps`, `GET /v2/web-app`; `useCreateWebApp`, `useUpdateWebApp`, `useDeleteWebApp` mutations; `useWebAppPctAccesses` for REST endpoint list from `GET /v2/web-app/pct-accesses`
- [ ] T069 [US3] Create web app list route `src/features/web-apps/routes/web-apps.tsx` at `/web-apps`: `DataTable` columns (Name/path, type badge, enabled badge, NameSpace, system/user-defined); search `q`, type filter, enabled filter
- [ ] T070 [P] [US3] Create web app detail route `src/features/web-apps/routes/web-app-detail.tsx` at `/web-apps/$appPath`: sections — General (path, namespace, description), Security (AutheEnabled decoded to checkbox list), Dispatch (DispatchClass, PackageName), REST Endpoints (from `useWebAppPctAccesses` or "endpoint info unavailable"); read-only fields visually marked (FR-028); Edit and Delete buttons
- [ ] T071 [P] [US3] Create `src/features/web-apps/components/WebAppForm.tsx`: TanStack Form + Zod; fields for Name, NameSpace, Description, DispatchClass, AutheEnabled, Enabled; portal-self-targeting warning if editing `VITE_SYSADMIN_API_BASE` web app path (FR-031)
- [ ] T072 [P] [US3] Create web app create/edit routes `/web-apps/new` and `/web-apps/$appPath/edit`; on save invalidate `useWebApps`
- [ ] T073 [P] [US3] Wire web app delete to `ConfirmDialog` with portal-self-targeting warning (FR-031); wire enable/disable to `ConfirmDialog` stating "clients will no longer reach this application"
- [ ] T074 [P] [US3] Add i18n translations in `src/shared/i18n/locales/en/web-apps.json`

**Checkpoint**: Create a REST web app, confirm it appears with type badge, disable and re-enable it, delete it. REST endpoint list shows or "unavailable" state shows gracefully.

---

## Phase 6: User Story 4 — Task Management (Priority: P2)

**Goal**: Administrator can list, inspect, enable/disable, run on demand, create, update, and delete scheduled tasks; failed tasks are visually highlighted.

**Independent Test**: See [quickstart.md §S5](quickstart.md).

- [ ] T075 [US4] Define task types in `src/features/tasks/types.ts`: `TaskListItem`, `Task`, `TaskInfo`, `TaskHistoryEntry`, `TASK_STATUS` map (from [data-model.md §Tasks](data-model.md))
- [ ] T076 [US4] Implement task API hooks in `src/features/tasks/hooks/useTasks.ts`, `useTask.ts`, `useTaskInfo.ts`, `useTaskHistory.ts`: `GET /v2/tasks`, `GET /v2/task`, `GET /v2/task/info`, `GET /v2/task/history`; `useCreateTask`, `useUpdateTask`, `useDeleteTask`, `useRunTask`, `useSuspendTask`, `useResumeTask` mutations
- [ ] T077 [US4] Create task list route `src/features/tasks/routes/tasks.tsx` at `/tasks`: `DataTable` columns (Name, Namespace, enabled/suspended badges, schedule summary via `scheduleToHuman`, last run time + result badge, next run); failed task row highlighted; status filter (active/suspended/failed); namespace filter; search
- [ ] T078 [P] [US4] Create task detail route `src/features/tasks/routes/task-detail.tsx` at `/tasks/$id`: shows task config (inline); runtime info from `useTaskInfo` (last started, finished, error, status); schedule in plain language; run history table from `useTaskHistory`; action buttons (Run, Suspend/Resume, Edit, Delete)
- [ ] T079 [P] [US4] Create `src/features/tasks/components/TaskForm.tsx`: TanStack Form + Zod; required fields (Name ≤50 chars, first char letter); schedule fields; run-as user; email notification fields
- [ ] T080 [P] [US4] Create task create/edit routes `/tasks/new` and `/tasks/$id/edit`; on save invalidate `useTasks` and `useTaskInfo`
- [ ] T081 [P] [US4] Wire Run Now to `ConfirmDialog`: title "Run [task name] now"; consequence "This will start an immediate run outside the normal schedule."; submit calls `useRunTask`; show loading state then refresh `useTaskInfo`
- [ ] T082 [P] [US4] Wire task delete to `ConfirmDialog`; system tasks (Type === "System" or "Maintenance") show delete button as disabled with tooltip "System tasks cannot be deleted" (FR-044)
- [ ] T083 [P] [US4] Add i18n translations in `src/shared/i18n/locales/en/tasks.json`; include human-readable schedule patterns

**Checkpoint**: Find a failing task (or create one that runs immediately), run it on demand, confirm status updates, suspend/resume it. Quickstart S5 passes.

---

## Phase 7: User Story 5 — Audit Events (Priority: P2)

**Goal**: Operator can browse, filter, and search IRIS audit event records; open record details; and enable/disable audit event types.

**Independent Test**: See [quickstart.md §S6](quickstart.md).

- [ ] T084 [US5] Define audit types in `src/features/audit/types.ts`: `AuditEventType`, `AuditRecord`, `AuditFilter` (from [data-model.md §Audit Events](data-model.md))
- [ ] T085 [US5] Implement audit API hooks in `src/features/audit/hooks/useAuditEventTypes.ts`: `GET /v2/security/audit/events`; `useUpdateAuditEventType` mutation for `PUT /v2/security/audit/event`; `useAuditRecords` hook: calls `POST /v2/security/audit/records` with filter params; uses `async-poll.ts` to resolve 202 responses; client-side free-text filter on resolved records
- [ ] T086 [US5] Create audit list route `src/features/audit/routes/audit.tsx` at `/audit`: `DataTable` columns (Timestamp via `formatTimestamp`, EventType + EventSource, Username, Description); event-type filter (select from `useAuditEventTypes`); time-range pickers; free-text search; active filters displayed as removable chips; loading skeleton during async poll
- [ ] T087 [P] [US5] Create audit record detail route `src/features/audit/routes/audit-detail.tsx` at `/audit/$index`: `GET /v2/security/audit/record?id=X`; shows all fields including EventData; breadcrumb back to list restoring filter state via URL search params
- [ ] T088 [P] [US5] Create `src/features/audit/components/AuditEventConfig.tsx`: table of event types from `useAuditEventTypes`; enable/disable toggle per row calls `useUpdateAuditEventType`; confirmation for bulk disable
- [ ] T089 [P] [US5] Add i18n translations in `src/shared/i18n/locales/en/audit.json`

**Checkpoint**: Filter audit events by type, search text, open a record detail, return to list with filters intact. Quickstart S6 passes.

---

## Phase 8: User Story 6 — System Monitoring and Process Control (Priority: P3)

**Goal**: Operator can view system resource metrics with threshold indicators, browse processes, drill into a process, and suspend/resume/terminate it.

**Independent Test**: See [quickstart.md §S9](quickstart.md).

- [ ] T090 [US6] Define system types in `src/features/system/types.ts`: `ProcessListItem`, `Process`, `SystemUsage`, `DeviceListItem` (from [data-model.md §System](data-model.md))
- [ ] T091 [US6] Implement system API hooks in `src/features/system/hooks/`: `useSystemUsage` (`GET /v2/monitor/system-usage`), `useMainDashboard` (`GET /v2/monitor/dashboard/main`), `useProcesses` (`GET /v2/processes`), `useProcess` (`GET /v2/process?pid=X`), `useDevices` (`GET /v2/devices`); `useSuspendProcess`, `useResumeProcess`, `useTerminateProcess` mutations; auto-refetch interval from `VITE_REFRESH_INTERVAL_MS`
- [ ] T092 [US6] Create `src/features/system/components/MetricCard.tsx`: shows a named metric as `current / total (pct%)`; status badge from string value ("Normal" green, "Warning" amber, "Critical" red); "not available" variant for missing metrics (FR-051b)
- [ ] T093 [P] [US6] Create system route `src/features/system/routes/system.tsx` at `/system`: tabs (Metrics, Processes, Devices); Metrics tab shows `MetricCard` grid from `useSystemUsage`; last-updated timestamp; manual refresh button; pause/resume auto-refresh toggle
- [ ] T094 [P] [US6] Create process list `src/features/system/components/ProcessTable.tsx`: `DataTable` with columns (PID, State, Namespace, Routine, Username, ClientIPAddress); search; links to process detail
- [ ] T095 [P] [US6] Create process detail route `src/features/system/routes/process-detail.tsx` at `/system/processes/$pid`: shows full `Process` fields; Suspend button (disabled + tooltip if `CanBeSuspended === false`); Terminate button (disabled + tooltip if `CanBeTerminated === false`); Resume button (shown when process is suspended); self-targeting warning if PID matches portal's own process
- [ ] T096 [P] [US6] Wire Suspend/Terminate actions to `ConfirmDialog`: consequence describes impact; Terminate consequence includes "This cannot be undone."; portal self-targeting adds an extra warning paragraph (FR-049)
- [ ] T097 [P] [US6] Add i18n translations in `src/shared/i18n/locales/en/system.json`

**Checkpoint**: View system metrics with threshold badges, browse process list, suspend and resume a process. Quickstart S9 passes.

---

## Phase 9: User Story 7 — Security Resources and Secrets (Priority: P3)

**Goal**: Administrator can manage X.509 credentials, SSL configurations, wallets/secrets, and OAuth configurations; secret values are never exposed.

**Independent Test**: See [quickstart.md §S7](quickstart.md).

- [ ] T098 [US7] Define security resource types in `src/features/security/x509/types.ts`, `src/features/security/ssl/types.ts`, `src/features/security/wallets/types.ts`, `src/features/security/oauth/types.ts` (from [data-model.md §Security Resources](data-model.md))
- [ ] T099 [US7] Implement X.509 API hooks in `src/features/security/x509/hooks/`: `useX509Credentials`, `useX509Credential`, `useX509Certificate`; `useCreateX509`, `useUpdateX509`, `useDeleteX509` mutations; `GET /v2/security/x509-credentials`, `GET /v2/security/x509-credential`, `GET /v2/security/x509-credential/certificate`
- [ ] T100 [P] [US7] Create X.509 list route `src/features/security/x509/routes/x509.tsx` at `/security/x509`: table with Name; certificate expiry status badge from `useX509Certificate` data per row; expired/expiring-soon rows highlighted
- [ ] T101 [P] [US7] Create X.509 detail route `src/features/security/x509/routes/x509-detail.tsx` at `/security/x509/$name`: shows certificate Subject, Issuer, ValidFrom, ValidTo from `useX509Certificate`; expiry status; OwnerList; "Private key: configured" or "not configured" — never shows key content (FR-035); Edit and Delete buttons
- [ ] T102 [P] [US7] Create X.509 create/edit form `src/features/security/x509/components/X509Form.tsx`: TanStack Form; private key field is masked, labelled "sensitive", cleared after save (FR-036); certificate file path field
- [ ] T103 [P] [US7] Implement SSL config hooks in `src/features/security/ssl/hooks/`: `useSslConfigs`, `useSslConfig`; mutations; `GET /v2/security/ssl-configurations`, `GET /v2/security/ssl-configuration`
- [ ] T104 [P] [US7] Create SSL config list route at `/security/ssl` and detail route at `/security/ssl/$name`: detail shows all fields; `PrivateKeyPassword: true` shown as "Password: configured" not the value (FR-035); Edit and Delete
- [ ] T105 [P] [US7] Implement wallet hooks in `src/features/security/wallets/hooks/`: `useWallets`, `useWallet`, `useWalletSecrets`; mutations for wallet CRUD and secret create/delete; `GET /v2/wallet/collections`, `GET /v2/wallet/collection`, `GET /v2/wallet/secrets`
- [ ] T106 [P] [US7] Create wallet list route at `/security/wallets`; wallet detail route at `/security/wallets/$name` showing wallet config and secrets list (Name, Type only — no values ever shown, FR-035); Add Secret and Delete Wallet buttons
- [ ] T107 [P] [US7] Create add-secret form `src/features/security/wallets/components/SecretForm.tsx`: type selector + config fields; all secret-value fields masked + labelled sensitive + cleared after save (FR-036)
- [ ] T108 [P] [US7] Implement OAuth hooks in `src/features/security/oauth/hooks/`: `useOAuthServerDefs`, `useOAuthClientConfigs`, `useOAuthResourceServers`; mutations; `GET /v2/security/oauth2/client/server-definitions`, `GET /v2/security/oauth2/client/client-configurations`, `GET /v2/security/oauth2/resource-servers`
- [ ] T109 [P] [US7] Create OAuth overview route at `/security/oauth` with three tabs: Server Definitions, Client Configurations, Resource Servers; detail routes for each; client secrets shown as "configured/not configured" only (FR-035)
- [ ] T110 [P] [US7] Create Security Resources navigation section route at `/security` (redirects to `/security/x509`) with sub-navigation tabs: X.509, SSL, Wallets, OAuth
- [ ] T111 [P] [US7] Add i18n translations in `src/shared/i18n/locales/en/security.json`

**Checkpoint**: Create an X.509 credential; confirm private key never shown anywhere after saving. Create a wallet and add a secret; confirm secret value never shown. Quickstart S7 passes.

---

## Phase 10: Polish and Cross-Cutting Concerns

**Purpose**: Accessibility hardening, responsive layout refinements, IRIS deployment, documentation, and E2E tests.

- [ ] T112 Run `eslint --plugin jsx-a11y` across all components; fix any critical/serious violations (FR-076)
- [ ] T113 [P] Keyboard navigation pass: tab through sign-in, user detail, ConfirmDialog, forms; verify visible focus indicator; verify focus enters dialogs and returns to trigger on close (FR-072, FR-073)
- [ ] T114 [P] Screen reader pass: verify all status badges, error messages, and form validation announcements use `aria-live` or `role="alert"` appropriately (FR-074)
- [ ] T115 [P] Mobile layout pass: test sidebar → drawer transition at ≤768 px; confirm no horizontal scroll on any route
- [ ] T116 Implement `iris/src/IrisConverge/Portal.cls`: ObjectScript `%CSP.REST` subclass that returns `index.html` for all unmatched routes (SPA fallback)
- [ ] T117 [P] Implement `iris/src/IrisConverge/REST.cls`: serves `dist/` static files; sets correct Content-Type per extension
- [ ] T118 [P] Finalize `iris/ipm.json`: set correct `webAppName`, `staticDir`, version; add `setup` module that copies `dist/` to IRIS mgr directory on `ipm install`
- [ ] T119 Write `README.md` at repo root: purpose, prerequisites (IRIS 2026.2+, Node.js 22), quick-start instructions (npm install → npm run build → ipm install), usage walkthrough of core workflows, licence statement (FR-079, FR-080, FR-081)
- [ ] T120 [P] Add `CONTRIBUTING.md`: development setup, VITE_ vars, running against local IRIS with CORS dev config, test commands
- [ ] T121 Implement Playwright E2E test `e2e/sign-in.spec.ts`: scenario S1 from quickstart.md (valid sign-in → dashboard loads → section visible; invalid credentials → error shown)
- [ ] T122 [P] Implement Playwright E2E test `e2e/permissions.spec.ts`: scenarios S3 + S4 (assign role, verify effective privileges, create/delete role with confirmation)
- [ ] T123 [P] Implement Playwright E2E test `e2e/tasks.spec.ts`: scenario S5 (run task on demand, verify status update)
- [ ] T124 [P] Implement Playwright E2E test `e2e/accessibility.spec.ts`: axe-core scan on dashboard, user list, task list, sign-in; assert zero critical/serious violations
- [ ] T125 Add Vite route-level dynamic imports for each feature area in `src/app/router.tsx`: wrap each feature's route module in `React.lazy()` + `Suspense` (SC-008 dashboard performance; Principle XVII)
- [ ] T126 [P] Update `CLAUDE.md` to reflect the established stack, source layout, and commands (`npm run dev`, `npm test`, `npm run build`, `ipm install`) per constitution note in Sync Impact Report

**Checkpoint**: All Playwright E2E tests pass. `npm run build` produces `dist/`. `ipm install` deploys the portal to IRIS. README quickstart completes in under 15 minutes from a clean clone.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Requires Phase 1 complete — **blocks all story phases**
- **Phase 3–9 (User Stories)**: All require Phase 2 complete; stories can proceed in priority order or in parallel if staffed
- **Phase 10 (Polish)**: Requires all desired story phases complete

### User Story Dependencies

| Story | Phase | Depends on | Notes |
|-------|-------|-----------|-------|
| US1 (Dashboard) | 3 | Phase 2 | Required for auth guard used by all other stories |
| US2 (Permissions) | 4 | Phase 2, US1 auth | Role traversal uses `permissions.ts` from Phase 2 |
| US3 (Web Apps) | 5 | Phase 2, US1 auth | Fully independent after auth |
| US4 (Tasks) | 6 | Phase 2, US1 auth | Uses `schedule.ts` from Phase 2 |
| US5 (Audit Events) | 7 | Phase 2, US1 auth | Uses async-poll from Phase 2 |
| US6 (System) | 8 | Phase 2, US1 auth | Fully independent after auth |
| US7 (Security) | 9 | Phase 2, US1 auth | Fully independent after auth |

### Within Each User Story

- Types → hooks → components/routes
- Hooks that compose other hooks depend on those hooks
- `ConfirmDialog` integration after the primary action is working

---

## Parallel Execution Examples

### Phase 3 (US1 Dashboard) parallel group

```text
Parallel: T033 (auth types) + T040 (dashboard types)
Parallel: T035 (useSignOut) + T036 (useSession) + T042 (MetricPanel) + T043 (TaskPanel) + T044 (AuditPanel) + T045 (CertPanel)
Sequential: T034 (useSignIn) → T037 (SignInForm) → T038 (sign-in route)
Sequential: T041 (useDashboardData) → T046 (dashboard route)
```

### Phase 4 (US2 Permissions) parallel group

```text
Parallel: T050 (user hooks) + T051 (role hooks) + T052 (resource hooks)
Sequential: T053 (useEffectivePrivileges) → depends on T051 (role hooks)
Parallel after types: T055 (user detail) + T056 (UserForm) + T060 (role detail) + T061 (RoleForm) + T064 (resource list) + T065 (resource detail)
```

---

## Implementation Strategy

### MVP First (US1 only — demo-ready in Phase 3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation
3. Complete Phase 3: US1 (sign-in + dashboard)
4. **STOP and VALIDATE**: Run Quickstart S1 and S2
5. Demo to confirm contest viability

### Incremental Delivery (P1 → P2 → P3)

1. Setup + Foundation → working shell
2. US1 (P1) → sign-in + dashboard → Quickstart S1–S2 ✓
3. US2 (P1) → permissions → Quickstart S3–S4 ✓
4. US3 (P2) → web apps → demo web app CRUD ✓
5. US4 (P2) → tasks → Quickstart S5 ✓
6. US5 (P2) → audit events → Quickstart S6 ✓
7. US6 (P3) → system + processes → Quickstart S9 ✓
8. US7 (P3) → security resources → Quickstart S7 ✓
9. Phase 10 → polish, deploy, docs → Quickstart S10–S11 ✓

### Parallel Team Strategy (3 developers)

Once Phase 2 is complete:
- **Dev A**: US1 → US2 (auth + permissions — core contest value)
- **Dev B**: US3 → US4 → US5 (web apps, tasks, audit — independent of US2)
- **Dev C**: US6 → US7 → Phase 10 (system, security, polish)

---

## Notes

- `[P]` tasks touch different files with no incomplete shared dependencies — safe to run in parallel
- `[USn]` labels map each task to its user story for traceability and independent delivery
- After each story checkpoint, run the corresponding quickstart.md scenario before starting the next story
- Commit after each logical group; use `git stash` before switching context mid-story
- Spec FR-035 (secrets never displayed) must be verified manually at every story-7 checkpoint — no automated test can fully cover all UI surfaces
- System tasks (`Type === "System"`) and predefined roles (`CreatedBy === "_SYSTEM"`) must be treated as read-only where the API returns errors for modification — test this on a real instance during quickstart
