# Quickstart Validation Guide: IRIS Management Portal

**Date**: 2026-09-26
**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

This guide documents the runnable validation scenarios that prove the portal works end-to-end against a live IRIS instance. Use it to verify the implementation before contest submission and after any significant change.

---

## Prerequisites

| Requirement | Minimum version / notes |
|-------------|------------------------|
| InterSystems IRIS | 2026.2+ (SysAdmin API v2 required) |
| Node.js | 22 LTS |
| npm | 10+ |
| A running IRIS instance | Accessible from your machine; `SuperUser` / `SYS` or equivalent admin credentials available |
| A test IRIS user | A non-admin user for permission testing (see Setup §3) |

---

## Setup

### 1. Install dependencies and build

```bash
npm install
npm run build       # produces dist/
```

### 2. Configure the API base

Copy `.env` to `.env.local` and set the address of your IRIS instance:

```bash
VITE_SYSADMIN_API_BASE=http://localhost:52773/api/sysadmin
```

For development with hot reload:

```bash
npm run dev         # starts Vite dev server on http://localhost:5173
```

### 3. Create a test user in IRIS

In the IRIS Management Portal (or via Terminal):
```objectscript
; Create a non-admin test user
Do ##class(Security.Users).Create("TestUser","password","Test User","","",1)
```

### 4. Deploy to IRIS (optional, for end-to-end validation)

```bash
cd iris
ipm install         # deploys web app to /iris-converge on the IRIS instance
```

Then open `http://localhost:52773/iris-converge/`.

---

## Validation Scenarios

Run these scenarios in order. Each scenario states the starting state, steps, and expected outcome. All scenarios run against a live IRIS instance.

---

### S1 — Sign In and Dashboard (SC-001, SC-008, FR-001, FR-003)

**Starting state**: Portal open at `/` (or `/sign-in`), not signed in.

**Steps**:
1. Open the portal. Confirm you are redirected to `/sign-in`.
2. Enter valid admin credentials and submit.
3. Observe the dashboard.

**Expected outcome**:
- First meaningful dashboard content visible within 3 seconds.
- Dashboard header shows the signed-in username and IRIS instance version.
- At least three of the four dashboard panels (system resources, task health, audit events, certificate expiry) show content or an "unavailable" state within 10 seconds.
- Navigation sidebar shows: Dashboard, Permissions, Web Applications, Security Resources, Tasks, System, Audit Events.

**S1b — Invalid credentials**:
1. Enter incorrect credentials and submit.
2. Expected: error message on the form, no dashboard content shown.

---

### S2 — Navigate between areas (SC-001, FR-006, FR-007)

**Starting state**: Signed in, on the dashboard.

**Steps**:
1. Click "Permissions" in the navigation.
2. Click "Tasks" in the navigation.
3. Click "Dashboard" in the navigation.

**Expected outcome**:
- Each navigation click takes at most 2 interactions to reach the target area.
- The active area is highlighted in the navigation.
- Returning to the dashboard takes 1 interaction from any area.

---

### S3 — User effective privileges (SC-002, FR-019–FR-022)

**Starting state**: Signed in, admin user.

**Steps**:
1. Open Permissions → Users.
2. Find and open the `TestUser` created in Setup §3.
3. Observe the user detail page.

**Expected outcome**:
- User detail shows: name, full name, enabled state, assigned roles (none initially).
- Effective privileges section is either empty (no roles) or shows inherited privileges with their source roles.

**S3b — Assign a role**:
1. Edit `TestUser`.
2. Add the role `%DB_USER` (or any role present on the instance).
3. Save.
4. Observe the effective privileges section.

**Expected outcome**:
- The assigned role appears in the user's role list.
- The effective privileges section shows the resources and permissions that `%DB_USER` grants, labelled with the role name.

---

### S4 — Create and delete a role (SC-004, SC-005, FR-023, FR-068, FR-069)

**Starting state**: Signed in, on Permissions → Roles.

**Steps**:
1. Create a new role:
   - Name: `TestRole_Converge`
   - Description: `Test role for portal validation`
   - Save.
2. Confirm the role appears in the role list.
3. Open the role detail. Confirm the description is shown.
4. Delete the role:
   - Click Delete.
   - Confirm a dialog appears naming the role and describing the consequence.
   - Confirm that the initial focus is NOT on the delete button.
   - Submit the delete.
5. Confirm the role is no longer in the list.

**Expected outcome**: All steps succeed. Delete required explicit confirmation.

---

### S5 — Task status and run on demand (SC-005, FR-040–FR-043, FR-045)

**Starting state**: Signed in, on Tasks.

**Steps**:
1. Find any active task in the list (e.g., `Purge Audit Log`).
2. Confirm the list shows: name, namespace, enabled state, schedule summary, last run time/result, next run.
3. Open the task detail. Confirm schedule is shown in plain language (e.g., "Daily at 02:00").
4. Click "Run now". Confirm a confirmation dialog appears naming the task.
5. Confirm the run. Observe the task status update.

**Expected outcome**:
- Run now requires confirmation.
- After confirmation, the task status reflects the run attempt (running or completed).
- If the task fails, the failure is visually highlighted and the error is accessible in the detail.

---

### S6 — Audit event filtering (SC-003, FR-052–FR-055)

**Starting state**: Signed in, on Audit Events.

**Steps**:
1. Open the Audit Events area.
2. Confirm the list shows entries with: timestamp, event name/type, username (when available).
3. Filter by event type to a single type (e.g., `Login`).
4. Confirm only matching records are shown and the active filter is visible.
5. Search for a specific username (e.g., `SuperUser`).
6. Confirm the combined filter + search works.
7. Open one record detail.
8. Confirm you return to the list with the same filters active after closing the detail.

**Expected outcome**:
- Search + filter combination works within 30 seconds from opening the area.
- Active filters are visible and can be individually removed.
- Detail opens without losing list state.

---

### S7 — Secret is never displayed (SC-006, FR-035, FR-036)

**Starting state**: Signed in, on Security Resources → X.509 Credentials (or Wallets).

**Steps**:
1. If no X.509 credential exists, create one with a private key.
2. After creating, open the credential detail.
3. Confirm no private key value is shown. Confirm the portal shows "private key: configured" or equivalent.
4. Navigate away and return. Confirm still no value shown.
5. Open any wallet secret. Confirm its value is never shown.

**Expected outcome**: Zero secret values visible anywhere after saving. Only "value is set" indicators.

---

### S8 — Error and unavailable states (FR-058–FR-060)

**Starting state**: Signed in, portal running against IRIS.

**Steps**:
1. Navigate to a URL for a resource that does not exist (e.g., `/permissions/users/NonExistentUser`).
2. Confirm a "not found" state is shown, not a blank page or crash.
3. Sign in as `TestUser` (who has limited privileges).
4. Navigate to Permissions → Users.
5. Confirm either a permission-denied state or a limited view, not a crash.

**Expected outcome**:
- Not-found and permission-denied states are distinct and display a meaningful message.
- No area shows a blank page on error; a recovery action (retry or return to list) is offered.

---

### S9 — Process suspend and resume (FR-047, FR-048, FR-049)

**Starting state**: Signed in, on System.

**Steps**:
1. Open the System area.
2. Confirm CPU, memory, and storage are shown with capacity context.
3. Open the process list.
4. Find a process with `CanBeSuspended: true`.
5. Click Suspend. Confirm a dialog names the process and explains the consequence.
6. Confirm the suspend. Observe the process state update.
7. Resume the process. Confirm it returns to running state.

**Expected outcome**:
- Suspend and resume require confirmation.
- Process state updates after each action.
- Suspend is not offered for processes where `CanBeSuspended` is `false`.

---

### S10 — Keyboard accessibility (SC-010, FR-072, FR-073)

**Starting state**: Signed in, on the sign-in page.

**Steps**:
1. Using keyboard only (Tab, Enter, Space, Escape, arrow keys):
   - Complete sign-in.
   - Navigate to Permissions → Users.
   - Open any user detail.
   - Navigate back to the list.
   - Open the create-user form.
   - Fill in the name field, leave the required password field empty, and attempt to submit.
   - Confirm focus moves to the first invalid field.
   - Close the form (Escape or cancel button).

**Expected outcome**:
- All steps are completable without a mouse.
- Focus is visible at all times (no invisible focus indicator).
- Dialog focus moves into the dialog on open and returns to the trigger on close.
- Validation failure moves focus to the first invalid field.

---

## Documentation Validation (SC-011, FR-079–FR-081)

1. Follow the README from a clean clone of the project (no local knowledge).
2. Confirm the portal is running against a fresh IRIS instance in under 15 minutes.
3. Confirm no credentials or instance-specific values are committed to the repository.

---

## Cleanup

After validation, remove the test user and role:
```objectscript
Do ##class(Security.Users).Delete("TestUser")
Do ##class(Security.Roles).Delete("TestRole_Converge")
```
