# Route Contract: IRIS Management Portal

**Date**: 2026-09-26
**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

This document defines the URL structure for the portal. Every route is a stable, shareable address (FR-009). Routes are implemented with TanStack Router; all are client-side routes with IRIS providing the SPA fallback (any path → `index.html`).

---

## Route Map

```
/                                       Dashboard
/sign-in                                Sign-in page (unauthenticated)

/permissions                            Permissions area (redirects to /permissions/users)
/permissions/users                      User list
/permissions/users/$username            User detail + effective privileges
/permissions/users/$username/edit       Edit user
/permissions/users/new                  Create user
/permissions/roles                      Role list
/permissions/roles/$roleName            Role detail (privileges + users)
/permissions/roles/$roleName/edit       Edit role
/permissions/roles/new                  Create role
/permissions/resources                  Resource list
/permissions/resources/$resourceName    Resource detail (roles granting access)

/web-apps                               Web application list
/web-apps/$appPath                      Web application detail
/web-apps/$appPath/edit                 Edit web application
/web-apps/new                           Create web application

/security                               Security Resources area (redirects to /security/x509)
/security/x509                          X.509 credential list
/security/x509/$name                    X.509 credential detail
/security/x509/$name/edit               Edit X.509 credential
/security/x509/new                      Create X.509 credential
/security/ssl                           SSL configuration list
/security/ssl/$name                     SSL configuration detail
/security/ssl/$name/edit                Edit SSL configuration
/security/ssl/new                       Create SSL configuration
/security/wallets                       Wallet collection list
/security/wallets/$name                 Wallet detail + secrets list
/security/wallets/$name/secrets/new     Add secret to wallet
/security/wallets/new                   Create wallet
/security/oauth                         OAuth overview (tabs: server defs, client configs, resource servers)
/security/oauth/server-definitions/$name     OAuth server definition detail
/security/oauth/client-configurations/$name  OAuth client configuration detail
/security/oauth/resource-servers/$name       OAuth resource server detail

/tasks                                  Task list
/tasks/$id                              Task detail + history
/tasks/$id/edit                         Edit task
/tasks/new                              Create task

/system                                 System overview (metrics + process list)
/system/processes/$pid                  Process detail

/audit                                  Audit event list (with filters)
/audit/$index                           Audit record detail
```

---

## Authentication Guard

All routes except `/sign-in` require an active session. The router applies a `beforeLoad` guard that checks for a valid access token and redirects to `/sign-in` if absent, preserving the intended URL as a `redirect` query parameter:

```
/sign-in?redirect=/permissions/users/Admin
```

After successful sign-in, the user is redirected to `redirect` (or `/` if absent).

---

## Route Parameter Encoding

| Route parameter | Encoding |
|-----------------|----------|
| `$username` | URI-encoded IRIS username |
| `$roleName` | URI-encoded role name (IRIS names may contain `%` prefix, e.g. `%All`) |
| `$resourceName` | URI-encoded resource name |
| `$appPath` | URI-encoded web application path (e.g. `/api/sysadmin` → `%2Fapi%2Fsysadmin`) |
| `$name` | URI-encoded credential/config/wallet/OAuth name |
| `$id` | Task integer ID |
| `$pid` | Process integer PID |
| `$index` | Audit record AuditIndex string |

---

## Search / Filter State

List routes carry filter and sort state as URL search parameters so that:
- Back navigation restores the list at its previous state (FR-008)
- Filtered views can be bookmarked and shared

| Route | Search params |
|-------|--------------|
| `/permissions/users` | `q` (text search), `enabled` (true/false) |
| `/permissions/roles` | `q` |
| `/permissions/resources` | `q` |
| `/web-apps` | `q`, `type` (rest/csp/other), `enabled` |
| `/tasks` | `q`, `status` (active/suspended/failed), `namespace` |
| `/system` | `q` (process search), `tab` (metrics/processes/devices) |
| `/audit` | `q`, `eventType`, `source`, `fromDate`, `toDate` |

---

## Navigation Labels

| Route prefix | Navigation label | Icon |
|---|---|---|
| `/` | Dashboard | `LayoutDashboard` |
| `/permissions` | Permissions | `ShieldCheck` |
| `/web-apps` | Web Applications | `Globe` |
| `/security` | Security Resources | `Lock` |
| `/tasks` | Tasks | `Clock` |
| `/system` | System | `Server` |
| `/audit` | Audit Events | `FileSearch` |

All labels are defined in `src/shared/i18n/locales/en/navigation.json` for translation.
