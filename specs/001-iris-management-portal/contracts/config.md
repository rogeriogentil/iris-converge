# Configuration Contract: IRIS Management Portal

**Date**: 2026-09-26
**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

This document defines all build-time and runtime configuration surfaces for the portal. No secrets are accepted through any of these surfaces (Principle XII).

---

## Build-Time Environment Variables (`VITE_` prefix — public)

All values are embedded into the built JavaScript bundle. **Do not place secrets here.**

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_SYSADMIN_API_BASE` | `string` | `/api/sysadmin` | Base path for the SysAdmin REST API. Must not include a trailing slash. May be an absolute URL for a different origin only in development (not for production IRIS deployment). |
| `VITE_APP_TITLE` | `string` | `iris-converge` | Browser tab title prefix. |
| `VITE_REFRESH_INTERVAL_MS` | `number` | `15000` | System metrics auto-refresh interval (milliseconds). Must be ≥ 5000. |
| `VITE_CERT_EXPIRY_WARNING_DAYS` | `number` | `30` | Days before a certificate expiry triggers a warning. |

---

## `.env` Files

| File | Purpose |
|------|---------|
| `.env` | Shared defaults checked into the repo (non-secret values only) |
| `.env.local` | Local overrides; **git-ignored** |
| `.env.production` | Production build values (checked in; must contain no secrets) |
| `.env.development` | Development defaults (e.g., different `VITE_SYSADMIN_API_BASE` for local IRIS) |

---

## IPM Package Configuration

The `iris/ipm.json` package manifest defines:

```json
{
  "name": "iris-converge",
  "version": "0.1.0",
  "description": "IRIS Management Portal",
  "webAppName": "/iris-converge",
  "staticDir": "dist/"
}
```

After `ipm install`, the web application is available at `https://<iris-host>:<port>/iris-converge/`.

The SysAdmin API must already be deployed at the IRIS instance. The portal assumes it is reachable at `VITE_SYSADMIN_API_BASE` (default `/api/sysadmin`).

---

## No-Secret Rule

The following information **must not** appear in any configuration file, environment variable, or source code:

- IRIS usernames or passwords
- JWT tokens
- Private keys or certificates
- OAuth client secrets
- Any other credential or sensitive value

Users authenticate at runtime through the portal's sign-in form.

---

## CORS

No CORS configuration is required when the portal is served from the same IRIS instance as the SysAdmin API (same origin). For development with a locally running IRIS, set `VITE_SYSADMIN_API_BASE` to the full IRIS URL (e.g., `http://localhost:52773/api/sysadmin`) and configure the IRIS SysAdmin web application to allow `http://localhost:5173` in its CORS settings.
