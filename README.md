# iris-converge

A unified management and operations portal for InterSystems IRIS, built as an entry for the [InterSystems Programming Contest](https://openexchange.intersystems.com/contest).

Licensed under [Apache 2.0](LICENSE).

---

## Overview

iris-converge is a modern, browser-based management portal that replaces the default IRIS Management Portal with a faster, more ergonomic interface. It surfaces system health, running tasks, audit events, certificate expiry, user/role permissions, and security resources — all from a single SPA that installs as an IRIS web application.

## Requirements

- **Node.js 22+** (see `.nvmrc` — `import.meta.dirname` requires Node ≥ 21.2)
- **InterSystems IRIS 2026.2+** (uses the SysAdmin REST API v2)
- An IRIS instance with the `/api/sysadmin` endpoint enabled

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5 + Vite 6 |
| Routing | TanStack Router v1 (file-based, type-safe) |
| Data fetching | TanStack Query v5 |
| Forms | TanStack Form + Zod |
| Tables | TanStack Table v8 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | Lucide React |
| i18n | i18next (English bundle) |
| Notifications | Sonner |
| Testing | Vitest 3 (unit) + Playwright (E2E) |
| IRIS packaging | InterSystems Package Manager (`iris/ipm.json`) |

## Project Structure

```
src/
├── app/
│   ├── routes/          # TanStack Router file-based routes
│   │   ├── __root.tsx
│   │   ├── sign-in.tsx
│   │   ├── _authenticated.tsx   # auth-guard layout
│   │   └── _authenticated/
│   │       └── index.tsx        # dashboard (/)
│   ├── main.tsx
│   ├── router.tsx
│   └── providers.tsx
├── features/            # feature-scoped code
│   ├── auth/
│   ├── dashboard/
│   ├── permissions/
│   ├── audit/
│   ├── security/
│   └── system/
├── shared/
│   ├── components/      # DataTable, PageLayout, ConfirmDialog, shadcn/ui
│   ├── http/            # apiFetch client, auth-store, async-poll
│   ├── utils/           # cn, date, permissions, schedule
│   └── i18n/
└── types/
    └── api.ts
iris/
└── ipm.json             # IRIS Package Manager manifest
```

## Getting Started

```bash
# 1. Use the required Node version
nvm use          # reads .nvmrc (Node 22)

# 2. Install dependencies
npm install

# 3. Configure the IRIS API base URL (copy and edit)
cp .env.development .env.local
# Set VITE_SYSADMIN_API_BASE to your IRIS instance, e.g.:
# VITE_SYSADMIN_API_BASE=http://localhost:52773/api/sysadmin

# 4. Start the dev server
npm run dev
```

The portal will be available at `http://localhost:5173`.

## Environment Variables

All variables are public build-time config (prefixed `VITE_`). **Never put secrets here.**

| Variable | Default | Description |
|---|---|---|
| `VITE_SYSADMIN_API_BASE` | `/api/sysadmin` | IRIS SysAdmin REST API base URL |
| `VITE_APP_TITLE` | `iris-converge` | Browser tab title |
| `VITE_REFRESH_INTERVAL_MS` | `15000` | Dashboard auto-refresh interval |
| `VITE_CERT_EXPIRY_WARNING_DAYS` | `30` | Days before cert expiry shown as warning |

## Commands

```bash
npm run dev        # start dev server with HMR
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build locally
npm run lint       # ESLint (zero warnings policy)
npm test           # Vitest unit tests (watch mode: npm run test:watch)
npm run test:e2e   # Playwright E2E tests (requires running dev server)
```

## Deploying to IRIS

After `npm run build`, the `dist/` folder contains the production assets. The `iris/ipm.json` manifest registers the portal as the `/iris-converge` web application:

```bash
# In an IRIS terminal or via IPM:
zpm "load /path/to/iris-converge"
```

Once loaded, access the portal at `http://<iris-host>:<port>/iris-converge`.

## Security Notes

- Passwords and secrets are **never** stored in browser storage or config files
- The access token is held in a module-level variable (memory only); the refresh token uses `sessionStorage`
- Secret values (passwords, private keys, client secrets) are never displayed after being saved
- `VITE_*` environment variables are embedded into the build and treated as **public information**
