# Research: IRIS Management Portal

**Date**: 2026-09-26
**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

This document records every decision made during Phase 0 research, resolving the unknowns identified in the Technical Context section of `plan.md`. All `NEEDS CLARIFICATION` items are resolved here.

---

## 1. SysAdmin API Coverage and IRIS Version

**Decision**: The InterSystems SysAdmin REST API v2 (`mainspec_v2.json`) provides complete coverage for all six portal areas. IRIS 2026.2 is the minimum required version.

**Rationale**: Direct inspection of the API spec confirms endpoints for: users, roles, resources, web applications, X.509 credentials, SSL configurations, wallets, wallet secrets, OAuth (client, server, resource-server), tasks (CRUD + run/suspend/resume + history), processes (list + suspend/resume/terminate), monitor dashboards, system usage, devices, and audit events. No custom backend or ObjectScript service layer is needed to fill gaps.

**Alternatives considered**:
- Building a custom ObjectScript REST layer to fill gaps: rejected — no gaps exist in the API for in-scope features.
- Using the older IRIS Management Portal REST API: rejected — the SysAdmin API v2 is the contest's specified API and is more complete.

---

## 2. Authentication and Token Storage

**Decision**: JWT authentication via POST `/login` (access token + refresh token). Access token stored in memory only (React context / module-level variable). Refresh token stored in `sessionStorage`. Automatic token refresh triggered when an API call returns 401 or when the access token is within 30 seconds of expiry.

**Rationale**:
- The SysAdmin API uses short-lived access tokens and long-lived refresh tokens (LoginResponse schema confirms this).
- Storing the access token in memory prevents XSS-based token theft from `localStorage` with minimal usability cost.
- `sessionStorage` for the refresh token is a pragmatic balance: it survives page reloads within the same browser tab but is cleared when the tab closes. It is not accessible to other tabs. It cannot be configured as `httpOnly`, but mitigates the most common XSS vectors since the session scope is limited.
- The portal is served from the same IRIS origin as the API, so no CORS configuration is needed.

**Auth flow**:
1. User submits credentials → POST `/login` → store `access_token` in memory, `refresh_token` in `sessionStorage`.
2. Every API request includes `Authorization: Bearer <access_token>`.
3. If a request returns 401, the HTTP client attempts POST `/refresh` once. On success, retry the original request.
4. On refresh failure or POST `/logout`, clear both tokens and redirect to sign-in.

**Token lifecycle**: The `exp` field from LoginResponse is used to schedule proactive refresh (30 s before expiry) via a `setTimeout` in the auth store.

**Alternatives considered**:
- `httpOnly` cookies: not available since the portal cannot configure IRIS to set them.
- `localStorage`: rejected — persists across sessions and is more exposed to XSS.
- Fully in-memory only (no `sessionStorage`): rejected — forces re-login on every page reload, which is disruptive for administrators.

---

## 3. API Base Path and Configuration

**Decision**: The SysAdmin API base URL is configurable via a Vite build-time environment variable `VITE_SYSADMIN_API_BASE` (default: `/api/sysadmin`). The shared HTTP client reads this at startup. It is not a secret.

**Rationale**: When the portal is deployed on the same IRIS instance it manages, the API base path is predictable (the IRIS web application mount path for the SysAdmin API). Using a `VITE_` variable allows deployers to override it without rebuilding. Since it is just a path, not a credential or secret, using a `VITE_` public variable is consistent with Principle XII.

**Alternatives considered**:
- Hard-coding `/api/sysadmin`: rejected — forces a rebuild for non-standard deployments.
- Runtime config fetched from IRIS: rejected — creates a chicken-and-egg dependency before the auth flow initialises.

---

## 4. Effective Privileges Computation

**Decision**: Effective privileges for a user are computed client-side by traversing the user's assigned roles and each role's `GrantedRoles` (included roles) recursively, collecting the `Resources` permissions from every role in the chain.

**Rationale**: The SysAdmin API provides:
- `GET /v2/security/user` → `User.Roles: string[]` (roles directly assigned to the user)
- `GET /v2/security/role` → `Role.Resources: {Name, Permissions}[]` and `Role.GrantedRoles: string[]` (roles this role includes)

There is no "effective privileges for user X" endpoint. The client fetches each needed role once (TanStack Query caches by role name), then builds the effective privilege set. Cycle detection is required for the role-hierarchy traversal to handle pathological cases.

**Data shape**:
```typescript
// effective privilege entry displayed in the UI
type EffectivePrivilege = {
  resourceName: string;
  permissions: string[]; // ["Read", "Write", "Use"]
  grantedBy: string[];   // role names that grant this privilege
};
```

**Alternatives considered**:
- A dedicated "effective privileges" endpoint: does not exist in the API.
- Showing only directly-assigned role permissions without inheritance: rejected — misleads administrators who need to understand full access.

---

## 5. IRIS SPA Hosting and SPA Fallback

**Decision**: The portal is deployed as an IRIS web application. A minimal ObjectScript dispatch class (`IrisConverge.Portal`) returns `index.html` for any URL path that does not match a known static asset. Static assets (`.js`, `.css`, `.woff2`, etc.) are served from the same web application's file system directory.

**Rationale**: Principle XIII requires IRIS to serve the static assets with no extra web server. IRIS CSP/web applications support a "DispatchClass" that intercepts unmatched requests. This is the standard IRIS pattern for hosting SPAs. The dispatch class is minimal — it serves files or falls back to `index.html`.

**IPM/ZPM package**: The `iris/` directory contains an IPM package manifest (`ipm.json`) and the two ObjectScript classes. Running `ipm install` deploys the web application and copies the `dist/` directory into the IRIS manager directory. This satisfies FR-081 (repeatable setup for evaluators).

**Alternatives considered**:
- Nginx as a reverse proxy: rejected — Principle XIII prohibits a separate web server.
- IRIS `HealthShare` CSP serving: same mechanism, no difference in practice.

---

## 6. shadcn/ui with Tailwind CSS v4

**Decision**: Use shadcn/ui with its Tailwind v4 configuration. Install components individually via `npx shadcn@latest add <component>`.

**Rationale**: shadcn/ui released official Tailwind v4 support in early 2026. The component source is copied into the project, so there is no shadcn/ui runtime dependency. Tailwind v4 uses CSS-first configuration (`@import "tailwindcss"`) instead of `tailwind.config.js`. The dark-mode token strategy required by the Artifact design contract is naturally supported.

**Alternatives considered**:
- Staying on Tailwind v3 with shadcn/ui v1: rejected — Tailwind v4 is the current version and avoids a migration mid-project.

---

## 7. i18next Setup

**Decision**: `i18next` + `react-i18next` with a single English namespace per feature area (e.g., `permissions.json`, `tasks.json`). Translations are loaded synchronously from the bundled JSON files (no lazy loading for this release). `i18next-browser-languagedetector` detects the browser locale but falls back to English.

**Rationale**: Simple setup consistent with Principle I (simplicity first). All text goes through `t()` from the start, enabling future translation without a second migration. A per-feature namespace avoids merge conflicts and keeps translation files manageable.

**Alternatives considered**:
- A single large `en.json`: rejected — creates merge conflicts as the project grows.
- Lazy-loaded namespaces: deferred — no evidence of performance need at this stage (Principle XVII).

---

## 8. Dashboard Data Strategy

**Decision**: The dashboard uses TanStack Query with `Promise.allSettled` semantics: each section runs its own query independently. A section that fails shows its own error state without affecting the others (FR-017). The dashboard queries are:
- `GET /v2/monitor/dashboard/main` → SystemUsage, Alerts, UpcomingTasks (for task health)
- `GET /v2/security/audit/records` (last 24 h, max 20 records) → recent events panel
- `GET /v2/security/x509-credentials` → certificate expiry panel

**Rationale**: The `MainDashboardStats` response includes `SystemUsage`, `Alerts`, `Licensing`, `UpcomingTasks`, and `Performance`. This single request covers CPU/memory/storage status and upcoming task state. A separate audit query provides the events panel. X.509 certificates are fetched separately for the expiry panel. All three queries are initiated in parallel via TanStack Query's `useQueries` hook.

**Alternatives considered**:
- A single combined dashboard endpoint: does not exist for all panel types.
- Fetching all entities separately on the dashboard: rejected — increases request count and complexity unnecessarily.

---

## 9. Task Status Interpretation

**Decision**: `TaskExtraInfo.Status` integer codes are mapped to user-readable states. A failed task is any task with Status ≤ -1.

**Mapping**:
| Status | Meaning |
|--------|---------|
| `1` | Success |
| `-1` | Currently running |
| `-2` | Untrapped error |
| `-3` | Setup error |
| `-4` | Timeout |
| `-5` | Post-process error |

**Rationale**: The API documents these codes. A human-readable label and icon are shown in the task list. Failed tasks (Status ≤ -1, excluding -1 "currently running") are visually highlighted (FR-045).

---

## 10. Process Actions Safety

**Decision**: The `Process` schema has `CanBeSuspended` and `CanBeTerminated` boolean fields (read-only). The portal reads these flags and disables the suspend/terminate actions when the process sets them to `false`. A specific warning is shown when the user targets the process serving the portal's own web session.

**Rationale**: The SysAdmin API itself returns `CanBeSuspended` and `CanBeTerminated` per process — exactly the safety metadata the spec requires (FR-049). The portal uses these rather than implementing its own judgment about which processes are safe.

**Self-targeting detection**: The portal compares the target process ID against the value in the current session (which can be inferred from the JobId in the `/info` response or an audit record).

---

## 11. Testing Strategy

**Decision**:
- **Unit tests (Vitest)**: `shared/http/client.ts`, `shared/utils/schedule.ts`, `shared/utils/permissions.ts`, Zod form schemas, role-hierarchy traversal logic.
- **Component tests (Vitest + React Testing Library)**: Forms (sign-in, user create/edit, task create), ConfirmDialog, EmptyState, ErrorState, DataTable pagination.
- **E2E tests (Playwright)**: Sign-in flow, dashboard load and section independence, user effective-privileges view, create and delete a role, run a task, filter audit events.

**Rationale**: Principle XV — tests prioritise meaningful behaviour over coverage targets. The HTTP client and utility functions carry the most risk from silent regressions. Forms and dialogs require DOM interaction tests. The five E2E flows cover the success criteria reviewable by contest judges.

---

## Resolved Unknowns Summary

| # | Unknown | Resolution |
|---|---------|-----------|
| 1 | API coverage for all areas | Fully covered by SysAdmin API v2 (IRIS 2026.2+) |
| 2 | Auth token storage | Memory (access) + sessionStorage (refresh); proactive refresh |
| 3 | API base path | `VITE_SYSADMIN_API_BASE` env var, default `/api/sysadmin` |
| 4 | Effective privileges | Client-side role-hierarchy traversal via TanStack Query |
| 5 | IRIS SPA hosting | ObjectScript dispatch class; IPM package for deployment |
| 6 | shadcn/ui + Tailwind v4 | Official Tailwind v4 shadcn/ui support |
| 7 | i18next | Per-feature namespaces, synchronous English JSON bundles |
| 8 | Dashboard data strategy | `useQueries` parallel independent queries, allSettled semantics |
| 9 | Task status codes | Integer-to-label map from API documentation |
| 10 | Process action safety | Use `CanBeSuspended`/`CanBeTerminated` flags from API |
| 11 | Testing strategy | Vitest unit/component + Playwright E2E for critical flows |
