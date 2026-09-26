# API DTO Contract: IRIS Management Portal

**Date**: 2026-09-26
**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md) | **Data Model**: [data-model.md](../data-model.md)

This document defines the HTTP API surface between the portal and the InterSystems SysAdmin REST API v2. It covers the endpoints used per feature area, their request/response shapes, and the error conventions the shared HTTP client normalises. Full TypeScript types are in [data-model.md](../data-model.md).

---

## Conventions

### Response Envelope

All successful responses are wrapped:
```json
{ "result": <payload> }
```

### Error Response

```json
{
  "status": 400,
  "errors": [
    { "field": "Name", "message": "Name is required" }
  ]
}
```
The HTTP client normalises all error responses into `ApiError` (see [data-model.md](../data-model.md)).

### Auth Header

All requests (except `/login` and `/refresh`) include:
```
Authorization: Bearer <access_token>
```

### Query Parameter Encoding

Route-level parameters (e.g., `?user=Admin`) are URI-encoded. IRIS names that start with `%` (e.g., `%All`) must be encoded as `%25All`.

---

## Authentication

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| POST | `/login` | `{user, password, role?}` | `LoginResponse` | Returns access+refresh JWT |
| POST | `/refresh` | `{refresh_token}` | `LoginResponse` | Issues new access token |
| POST | `/logout` | `{refresh_token}` | `{}` | Invalidates refresh token |
| POST | `/revoke` | `{access_token}` | `{}` | Revokes access token |
| GET | `/info` | — | `ServerInfo` | Instance info + current user's privileges |

---

## Permissions — Users

| Method | Path | Query / Body | Notes |
|--------|------|---------|-------|
| GET | `/v2/security/users` | `?names=*&maxRows=500` | Returns `UserList` |
| GET | `/v2/security/user` | `?user=<name>` | Returns `User` |
| POST | `/v2/security/user` | `User` body | Create user |
| PUT | `/v2/security/user` | `?user=<name>` + `User` body | Update user |
| DELETE | `/v2/security/user` | `?user=<name>` | Delete user |
| POST | `/v2/security/user/password` | `?user=<name>` + `{password}` | Change password |

---

## Permissions — Roles

| Method | Path | Query / Body | Notes |
|--------|------|---------|-------|
| GET | `/v2/security/roles` | `?names=*&maxRows=500` | Returns `RoleList` |
| GET | `/v2/security/role` | `?role=<name>` | Returns `Role` |
| PUT | `/v2/security/role` | `?role=<name>` + `Role` body | Create or update role |
| DELETE | `/v2/security/role` | `?role=<name>` | Delete role |
| GET | `/v2/security/role/owners` | `?role=<name>` | Returns `RoleOwnerList` |

---

## Permissions — Resources

| Method | Path | Query / Body | Notes |
|--------|------|---------|-------|
| GET | `/v2/security/resources` | `?names=*&maxRows=500` | Returns `ResourceList` |
| GET | `/v2/security/resource` | `?resource=<name>` | Returns `Resource` |
| PUT | `/v2/security/resource` | `?resource=<name>` + `Resource` body | Create or update resource |
| DELETE | `/v2/security/resource` | `?resource=<name>` | Delete resource |

---

## Web Applications

| Method | Path | Query / Body | Notes |
|--------|------|---------|-------|
| GET | `/v2/web-apps` | `?names=*&maxRows=500` | Returns `WebApplicationList` |
| GET | `/v2/web-app` | `?name=<path>` | Returns `Application` |
| PUT | `/v2/web-app` | `?name=<path>` + `Application` body | Create or update |
| DELETE | `/v2/web-app` | `?name=<path>` | Delete |
| GET | `/v2/web-app/pct-accesses` | `?name=<path>` | PCT access list (REST endpoint info) |

---

## Security Resources — X.509

| Method | Path | Query / Body | Notes |
|--------|------|---------|-------|
| GET | `/v2/security/x509-credentials` | — | Returns `X509CredentialsList` |
| GET | `/v2/security/x509-credential` | `?name=<name>` | Returns `X509Credential` |
| GET | `/v2/security/x509-credential/certificate` | `?name=<name>` | Returns certificate details |
| POST | `/v2/security/x509-credential` | Body with PEM content | Create |
| PUT | `/v2/security/x509-credential` | `?name=<name>` + body | Update |
| DELETE | `/v2/security/x509-credential` | `?name=<name>` | Delete |

---

## Security Resources — SSL Configurations

| Method | Path | Query / Body | Notes |
|--------|------|---------|-------|
| GET | `/v2/security/ssl-configurations` | — | Returns `SSLConfigurationList` |
| GET | `/v2/security/ssl-configuration` | `?name=<name>` | Returns `SSLConfig` |
| PUT | `/v2/security/ssl-configuration` | `?name=<name>` + body | Create or update |
| DELETE | `/v2/security/ssl-configuration` | `?name=<name>` | Delete |
| POST | `/v2/security/ssl-configuration/test` | `?name=<name>` | Test configuration |

---

## Security Resources — Wallets

| Method | Path | Query / Body | Notes |
|--------|------|---------|-------|
| GET | `/v2/wallet/collections` | — | Returns `WalletCollectionList` |
| GET | `/v2/wallet/collection` | `?collection=<name>` | Returns `WalletCollection` |
| PUT | `/v2/wallet/collection` | `?collection=<name>` + body | Create or update |
| DELETE | `/v2/wallet/collection` | `?collection=<name>` | Delete |
| GET | `/v2/wallet/secrets` | `?collection=<name>` | Returns `WalletSecretList` |
| PUT | `/v2/wallet/secret` | `?collection=<name>&secret=<name>` + `WalletSecretWrite` | Create or update secret |
| DELETE | `/v2/wallet/secret` | `?collection=<name>&secret=<name>` | Delete secret |

**Important**: Wallet secrets are write-only. GET `/v2/wallet/secrets` returns names and types only; secret values are never returned.

---

## Security Resources — OAuth

| Method | Path | Notes |
|--------|------|-------|
| GET/PUT/DELETE | `/v2/security/oauth2/client/server-definition[s]` | Authorization server defs |
| GET/PUT/DELETE | `/v2/security/oauth2/client/client-configuration[s]` | Client configs |
| POST | `/v2/security/oauth2/client/client-configuration/secrets` | Rotate client secret |
| GET/PUT/DELETE | `/v2/security/oauth2/resource-server[s]` | Resource servers |
| GET/PUT/DELETE/POST | `/v2/security/oauth2/server` | OAuth authorization server |
| GET/PUT/DELETE/POST | `/v2/security/oauth2/server/client[s]` | Clients registered on the server |

Client secrets and private keys are never returned in GET responses.

---

## Tasks

| Method | Path | Query / Body | Notes |
|--------|------|---------|-------|
| GET | `/v2/tasks` | `?maxRows=500` | Returns `TaskList` |
| GET | `/v2/task` | `?id=<id>` | Returns `Task` (config) |
| GET | `/v2/task/info` | `?id=<id>` | Returns `TaskExtraInfo` (runtime status) |
| GET | `/v2/task/history` | `?id=<id>` | Returns `TaskHistory` |
| GET | `/v2/task/upcoming` | — | Returns `UpcomingTasks` |
| POST | `/v2/task` | `Task` body | Create task |
| PUT | `/v2/task` | `?id=<id>` + `Task` body | Update task |
| DELETE | `/v2/task` | `?id=<id>` | Delete task |
| POST | `/v2/task/run` | `?id=<id>` | Run task on demand |
| POST | `/v2/task/suspend` | `?id=<id>` | Suspend task |
| POST | `/v2/task/resume` | `?id=<id>` | Resume suspended task |

---

## System

| Method | Path | Notes |
|--------|------|-------|
| GET | `/v2/monitor/dashboard/main` | Dashboard stats (Performance, Status, Usage, Alerts, Tasks) |
| GET | `/v2/monitor/system-usage` | Detailed system usage stats |
| GET | `/v2/monitor/dashboard/system-resources` | Shared memory / system resource locks |
| GET | `/v2/processes` | Returns `ProcessList` |
| GET | `/v2/process` | `?pid=<pid>` → `Process` |
| POST | `/v2/process/suspend` | `?pid=<pid>` |
| POST | `/v2/process/resume` | `?pid=<pid>` |
| POST | `/v2/process/terminate` | `?pid=<pid>` |
| GET | `/v2/devices` | Returns `DeviceList` |
| GET | `/v2/device` | `?name=<name>` → `Device` |

---

## Audit Events

| Method | Path | Query / Body | Notes |
|--------|------|---------|-------|
| GET | `/v2/security/audit/events` | — | Returns `AuditEventList` (event type config) |
| PUT | `/v2/security/audit/event` | `?source=<s>&type=<t>&event=<e>` + `{Enabled}` | Enable/disable event |
| POST | `/v2/security/audit/records` | `{BeginDate, EndDate, maxRows, ...}` body | Fetch audit records (async) |
| GET | `/v2/security/audit/record` | `?id=<AuditIndex>` | Single record detail |
| GET | `/v2/security/audit/enabled` | — | Returns `AuditingEnabled` |
| PUT | `/v2/security/audit/enabled` | `{Enabled}` body | Enable/disable auditing globally |

**Note**: `POST /v2/security/audit/records` may return an async task reference (`AsyncTask`). The HTTP client must poll `GET /v2/async-result?id=<taskId>` until `status` is complete, then read the result from `AsyncTaskResultListAuditRecords`. The portal displays a loading state during the poll.

---

## Async Task Polling Pattern

Several SysAdmin API operations are asynchronous (audit record queries, database operations). The HTTP client handles this transparently:

1. POST/GET returns `202 Accepted` with `{ result: { asyncTaskId: "..." } }`.
2. Poll `GET /v2/async-result?id=<asyncTaskId>` every 2 seconds.
3. When `status === "complete"`, read `result`.
4. When `status === "error"`, surface the error.
5. Support cancel via `POST /v2/async-result/cancel?id=<asyncTaskId>`.

Components see a single TanStack Query that resolves only when the async result is ready.

---

## HTTP Status Code Handling

| Status | Portal behaviour |
|--------|-----------------|
| 200 | Return `result` payload |
| 202 | Begin async polling |
| 400 | Parse field errors; show in form |
| 401 | Attempt token refresh; if fails → sign-in redirect |
| 403 | Show permission-denied state with resource name when available |
| 404 | Show "not found" state |
| 409 | Show conflict error (entity changed since load) |
| 422 | Parse validation errors; show in form |
| 500 | Show server error state with option to show detail |
| network error | Show connection-error state with retry |
