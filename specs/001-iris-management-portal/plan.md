# Implementation Plan: IRIS Management Portal

**Branch**: `001-iris-management-portal` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-iris-management-portal/spec.md`

## Summary

Build a client-side React SPA that talks directly to the InterSystems SysAdmin REST API (v2, requires IRIS 2026.2+) across all six contest management areas plus a dashboard and audit events view. Static assets are built by Vite and served from IRIS. No custom backend or BFF is introduced. All management operations go through a shared HTTP client that handles JWT authentication, token refresh, and error normalisation.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 22 LTS (build toolchain)

**Primary Dependencies** (all from constitution):
- React 19, Vite 6
- TanStack Router v1 (file-based routes, type-safe deep links)
- TanStack Query v5 (server state, caching, background refetch)
- TanStack Table v8 (sortable/filterable lists)
- TanStack Form v0.x + Zod (forms and client-side validation)
- shadcn/ui (accessible component library, Tailwind v4 variant)
- Tailwind CSS v4
- Lucide React (icons)
- i18next + react-i18next (translations; English only for this release)

**Storage**: None (no portal-side persistence). Server state is cached by TanStack Query in memory. No database, IndexedDB, or other client storage is used for application state. `sessionStorage` holds the JWT refresh token only (see Security note in research.md).

**Testing**:
- Vitest + React Testing Library — unit and component tests
- Playwright — E2E tests for the critical auth, permissions, and dashboard flows

**Target Platform**: Evergreen desktop and mobile browsers. Static assets are served by IRIS (Principle XIII). IRIS 2026.2+ required for the SysAdmin API.

**Project Type**: Single-page web application (CSR). No SSR or SSG.

**Performance Goals**:
- Dashboard first meaningful content < 3 s (SC-008)
- Audit event search < 30 s (SC-003)
- Standard TanStack Query stale-time and refetch defaults elsewhere

**Constraints**:
- No custom backend, BFF, or extra web server (Principle VI / XIII)
- No IRIS-side ObjectScript business logic beyond the SPA dispatch class
- Secrets (passwords, private keys, client secrets) never stored or logged client-side
- VITE_ environment variables used only for non-secret build configuration (API base path)
- SPA fallback routing required from IRIS web application

**Scale/Scope**: Single IRIS instance; 8 portal areas (Dashboard, Permissions, Web Apps, Security Resources, Tasks, System, Audit Events, + optional API Explorer)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Baseline gates from `.specify/memory/constitution.md` (v1.0.0):

- [x] **I. Simplicity**: No speculative abstractions. Shared code extracted only for genuine reuse (HTTP client, shared components). Feature code stays in its feature.
- [x] **II. Feature-based**: Each portal area is a feature module under `src/features/`. No premature technical layers.
- [x] **III. Stack**: React, Vite, TanStack family, Zod, shadcn/ui, Tailwind, Lucide, i18next — all established. No new dependencies without justification.
- [x] **IV/V. Responsibilities & state**: TanStack Query for all server state; React `useState`/`useReducer` for local UI state; no global state library.
- [x] **VI. Direct IRIS API**: The HTTP client in `src/shared/http/` calls the SysAdmin API directly. No backend/BFF introduced.
- [x] **VII. API contract**: DTOs mirror the SysAdmin API OpenAPI schemas. Mappers live in feature code, separate from components.
- [x] **VIII. Validation**: Zod schemas for all form inputs; IRIS 4xx validation errors are parsed by the HTTP client and surfaced as field-level or form-level errors.
- [x] **IX. Feedback**: Loading skeletons, empty-state components, error boundaries, toast (success), AlertDialog (destructive), field-level error messages — all per context.
- [x] **X. Accessibility**: semantic HTML, shadcn/ui accessible components, keyboard nav, ESLint jsx-a11y rules.
- [x] **XI. Responsive**: Single implementation. Sidebar on desktop collapses to drawer on mobile.
- [x] **XII. Security**: IRIS handles auth and access control. No custom auth logic. API base path in `VITE_` is not a secret. Refresh token in `sessionStorage` (not a secret value — it's a session credential, not application configuration).
- [x] **XIII/XIV. Deployment & rendering**: CSR only. Vite builds to `dist/`. Static assets served by IRIS via a minimal ObjectScript web application dispatch class. SPA fallback handled by the dispatch class.
- [x] **XV. Testing**: Unit tests for HTTP client, mappers, Zod schemas, and schedule-parsing utilities. Component tests for forms and feedback states. Playwright E2E for auth, dashboard, and permission flows.
- [x] **XVI. Observability**: Global React error boundary at app root. Shared `logger` utility wraps `console` (swapped in tests). Unhandled query errors surfaced to the boundary.
- [x] **XVII. Optimization**: No premature optimisation. TanStack Query is the cache. Route-level code splitting via Vite dynamic imports. No additional bundler plugins without evidence.
- [x] **XVIII–XX. Consistency & decisions**: This plan is the explicit architectural decision record for all choices below. Any future change to stack, state management, auth model, or deployment must update this plan.

## Project Structure

### Documentation (this feature)

```text
specs/001-iris-management-portal/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   ├── routes.md
│   ├── config.md
│   └── api-dtos.md
└── tasks.md             ← /speckit-tasks output (not yet created)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── main.tsx             # Entry point: router + providers
│   ├── router.tsx            # TanStack Router root definition
│   └── providers.tsx         # QueryClient, i18n, ErrorBoundary
├── features/
│   ├── auth/
│   │   ├── components/       # SignInForm, SessionExpiredBanner
│   │   ├── hooks/            # useSession, useSignIn, useSignOut
│   │   ├── types.ts          # Session, TokenPayload DTOs
│   │   └── routes/           # /sign-in route
│   ├── dashboard/
│   │   ├── components/       # DashboardCard, MetricWidget, AlertBanner
│   │   ├── hooks/            # useDashboardData (parallel queries)
│   │   └── routes/           # / route
│   ├── permissions/
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── routes/       # /permissions/users, /permissions/users/$name
│   │   ├── roles/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── routes/       # /permissions/roles, /permissions/roles/$name
│   │   └── resources/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── routes/       # /permissions/resources, /permissions/resources/$name
│   ├── web-apps/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── routes/           # /web-apps, /web-apps/$path
│   ├── security/
│   │   ├── x509/
│   │   ├── ssl/
│   │   ├── wallets/
│   │   └── oauth/
│   │       └── routes/       # /security, /security/x509, /security/ssl, etc.
│   ├── tasks/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── routes/           # /tasks, /tasks/$id
│   ├── system/
│   │   ├── components/       # MetricCard, ProcessTable, DeviceList
│   │   ├── hooks/
│   │   └── routes/           # /system
│   └── audit/
│       ├── components/
│       ├── hooks/
│       └── routes/           # /audit
├── shared/
│   ├── http/
│   │   ├── client.ts         # Fetch wrapper; auth header; error normalisation
│   │   ├── auth-store.ts     # In-memory access token; sessionStorage refresh token
│   │   └── errors.ts         # ApiError, ValidationError, PermissionError types
│   ├── components/
│   │   ├── DataTable/        # TanStack Table wrapper
│   │   ├── ConfirmDialog/    # AlertDialog for destructive actions
│   │   ├── EmptyState/
│   │   ├── ErrorState/
│   │   └── PageLayout/       # Shell with sidebar/drawer nav
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/en/       # One JSON file per feature area
│   └── utils/
│       ├── schedule.ts       # Cron/schedule → human-readable string
│       ├── date.ts           # ISO timestamp → display string with timezone
│       └── permissions.ts    # "RWU" → ["Read","Write","Use"]
└── types/
    └── api.ts                # BaseResponse<T>, ErrorResponse shapes

iris/                         # IRIS deployment package
├── ipm.json                  # IPM/ZPM package manifest
└── src/
    └── IrisConverge/
        ├── Portal.cls        # SPA dispatch class: serves index.html for all routes
        └── REST.cls          # Static file handler (forwards /*.js,*.css to static dir)
```

**Structure Decision**: Frontend-only, feature-based layout (Principles II and VI). Each portal area has its own directory under `src/features/`. `src/shared/` contains only code with demonstrated reuse. `iris/` is the minimal IRIS ObjectScript package needed to host the SPA. There is no backend directory and no layered models/services/controllers.

## Complexity Tracking

> No constitution violations. No entries required.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |
