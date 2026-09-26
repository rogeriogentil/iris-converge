# Feature Specification: IRIS Management Portal

**Feature Branch**: `main` (no feature branch created; no branch hook is configured)

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "Create a product specification for a web-based management portal for InterSystems IRIS, developed as an entry for the InterSystems Programming Contest 'Build Your Own Management Portal'." (full description in `my-specify.md`)

## Product Overview

iris-converge is a web-based management portal for a single InterSystems IRIS instance. It is an alternative to the native IRIS Management Portal: a modern, focused interface that brings the administration and operations work people do most often into one consistent experience.

The portal is an entry for the InterSystems Programming Contest "Build Your Own Management Portal". It covers the six management areas named by the contest: permissions, web applications and REST APIs, security and secrets, tasks, the operating system, and logs. It adds an operational dashboard on top of them.

### Goals

- **Clarity**: present IRIS information in a form people can understand quickly, not as raw management data.
- **Efficiency**: let users finish frequent administrative workflows in fewer steps than the native portal.
- **Discoverability**: make IRIS management capabilities easy to find through an organization that follows how IRIS administration is conceptually structured.
- **Consistency**: use the same interaction patterns, states and feedback in every management area.
- **Operational visibility**: show what needs attention now.
- **Safety**: make state-changing and destructive actions deliberate, explained and confirmed.
- **Meaningful feedback**: make every operation's outcome, success or failure, explicit and understandable.

### Target Users and Primary Needs

| User | Primary needs |
|------|---------------|
| **IRIS administrator** | Manage users, roles, privileges, web applications, security resources and tasks safely; understand who can access what. |
| **Operator / SRE** | See the instance's health at a glance; spot errors, warnings and failing tasks; check resource usage; diagnose incidents from logs. |
| **Developer** | Inspect and configure web applications and REST endpoints; understand the available management capabilities; check logs while troubleshooting. |
| **Technical user / auditor** | Inspect configuration and authorization relationships without risking accidental changes. |

The portal serves a technical audience. It must still not require users to understand how the underlying management interfaces work.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in and see the state of the instance (Priority: P1)

An operator opens the portal, signs in with their IRIS credentials, and lands on a dashboard. The dashboard summarizes the instance's health: system resource status, task problems, recent errors and warnings, and security or configuration items that need attention. From any item that needs attention they can go straight to the relevant detail, and they can return to the dashboard from anywhere.

**Why this priority**: This is the entry point for every other workflow and the first impression for contest judges. On its own it already gives real operational value, a single "is everything OK?" view.

**Independent Test**: Sign in against a running IRIS instance, confirm that the dashboard shows resource, task, event and security summaries, then open one summary item and return to the dashboard.

**Acceptance Scenarios**:

1. **Given** a user with valid IRIS credentials, **When** they sign in, **Then** they land on the dashboard and see who they are signed in as and which instance they are connected to.
2. **Given** invalid credentials, **When** the user tries to sign in, **Then** they see a clear sign-in failure message that does not reveal whether the username exists.
3. **Given** the instance has recent error-level events, **When** the dashboard loads, **Then** those events appear in an attention area with their count, time and source, and each links to its detail in the log view.
4. **Given** one dashboard data source is unavailable (for example the user lacks the privilege to read it), **When** the dashboard loads, **Then** the other dashboard sections still display and the affected section states that it is unavailable and why.
5. **Given** a signed-in user, **When** they choose to sign out, **Then** their session ends and portal content is no longer reachable without signing in again.

---

### User Story 2 - Understand and manage who can do what (Priority: P1)

An administrator needs to know why a user can (or cannot) access a resource. They open a user, see the roles assigned to that user, and see the privileges (resource and permission) those roles grant, all in one place. They can also start from a role, or from a resource, and see who holds it. They create a new role, grant it privileges, assign it to a user, and later remove it. Every destructive step asks for explicit confirmation.

**Why this priority**: Permission management is the most important administrative area named by the contest. Showing authorization relationships clearly is the main way the portal adds value beyond raw data.

**Independent Test**: Create a role, grant it a privilege, assign it to a test user, confirm that the user's effective privileges show the new access and which role grants it, then delete the role after confirming.

**Acceptance Scenarios**:

1. **Given** a list of users, **When** the administrator opens a user, **Then** they see the user's profile attributes, enabled/disabled state, assigned roles, and the effective privileges derived from those roles, each privilege showing which role(s) grant it.
2. **Given** a role, **When** the administrator opens it, **Then** they see its description, the privileges it grants, the roles it includes (if any), and the users who hold it.
3. **Given** a resource, **When** the administrator inspects it, **Then** they see which roles grant which permissions on it.
4. **Given** the create-user form, **When** the administrator submits it with a missing required field or an invalid value, **Then** the form shows a field-level message next to each invalid field and nothing is submitted.
5. **Given** a role that is assigned to users, **When** the administrator deletes it, **Then** a confirmation names the role, states how many users will lose it, and requires an explicit confirming action before anything is deleted.
6. **Given** an administrator editing their own account, **When** they attempt a change that would remove their own ability to administer the portal (such as disabling their own user or removing their own administrative role), **Then** the portal warns them about the risk of locking themselves out before asking for confirmation.
7. **Given** IRIS rejects an operation (for example deleting a predefined system role), **When** the rejection is returned, **Then** the user sees a plain-language explanation of why it failed and the entity is shown unchanged.

---

### User Story 3 - Manage web applications and understand REST APIs (Priority: P2)

A developer browses the web applications defined on the instance, filters them by type (REST, CSP/web pages, other) and state, and opens one to see its configuration grouped into understandable sections: general information, security and authentication, dispatch/REST handling, and file serving. For REST applications, they see the endpoints the application exposes, each with its HTTP method and path. They create a new REST web application, disable an old one, and later re-enable it.

**Why this priority**: Configuring web applications is a frequent developer task and a named contest area. It depends on no other stories.

**Independent Test**: Create a REST web application, confirm that it appears in the list with its type and state, disable and re-enable it, then delete it after confirming.

**Acceptance Scenarios**:

1. **Given** the web application list, **When** the user views it, **Then** each entry shows its path, type, enabled state, namespace, and whether it is a system application or user-defined.
2. **Given** a web application detail view, **When** the user views it, **Then** fields that cannot be changed are visually and semantically distinguished from editable fields.
3. **Given** a REST web application whose endpoint definitions can be determined, **When** the user opens it, **Then** they see a list of its endpoints (method, path, and handler/description when available).
4. **Given** a REST web application whose endpoint definitions cannot be determined, **When** the user opens it, **Then** the portal states that endpoint information is unavailable rather than showing an empty list.
5. **Given** the user disables a web application, **When** they confirm, **Then** the application shows as disabled and the confirmation explained that clients will no longer be able to reach it.
6. **Given** the web application that serves the portal itself, **When** the user attempts to disable, modify its security, or delete it, **Then** the portal warns that this may make the portal itself inaccessible.

---

### User Story 4 - Manage scheduled tasks (Priority: P2)

An administrator sees all scheduled tasks with their status, last run result, and next scheduled run. They find a task that failed last night, inspect its details and run history, fix its schedule, run it immediately, and see the outcome.

**Why this priority**: Task failures are a common operational problem. Clear state and scheduling information shows the portal's value.

**Independent Test**: Create a task with a simple schedule, run it on demand, confirm that its last-run status and time update, disable it, and confirm that its next scheduled run shows as none.

**Acceptance Scenarios**:

1. **Given** the task list, **When** the user views it, **Then** each task shows name, enabled/suspended state, namespace, schedule summary in plain language (for example "Daily at 02:00"), last run time and result, and next scheduled run.
2. **Given** a task whose last run failed, **When** the user views the task list or dashboard, **Then** the failure is visually highlighted and the task detail shows the failure information available.
3. **Given** a task, **When** the user selects "run now" and confirms, **Then** the portal reports that the run was started and reflects the updated last-run information once available.
4. **Given** a task, **When** the user disables it, **Then** its state shows as disabled and it no longer shows a next scheduled run.
5. **Given** a system-defined task that cannot be deleted, **When** the user views it, **Then** the delete action is unavailable and the reason is shown.

---

### User Story 5 - Diagnose problems from logs and events (Priority: P2)

An operator investigating an incident opens the logs area. They choose a log source, narrow it to errors and warnings in the last hour, search for a keyword, and open an entry to see its full details. They can distinguish informational, warning, and error events at a glance.

**Why this priority**: Diagnosis is the most frequent operational task after checking health, and it gives the dashboard's attention items somewhere to link to.

**Independent Test**: Produce a known warning in IRIS, then find it in the logs area by filtering on severity and searching its text, and open its details.

**Acceptance Scenarios**:

1. **Given** the logs area, **When** the user opens it, **Then** they can choose among the available log sources and each entry shows timestamp, severity (when available), source/subsystem (when available), and a message summary.
2. **Given** a log source, **When** the user filters by severity and time range and enters a search term, **Then** only matching entries are shown and the active filters are visible and individually removable.
3. **Given** a log entry, **When** the user opens it, **Then** they see its complete content, including any multi-line details, without losing their place or filters in the list.
4. **Given** a log source that does not provide severity, **When** entries are displayed, **Then** the severity filter is unavailable for that source, and nothing implies that severity data exists.
5. **Given** filters that match nothing, **When** the result is empty, **Then** the portal shows a "no matching entries" state that differs from "this log is empty" and offers to clear the filters.

---

### User Story 6 - Check operating system and resource status (Priority: P3)

An operator checks the host IRIS runs on: CPU and memory usage, disk/storage capacity and free space, devices, and the processes running in IRIS. Values near a limit are clearly flagged, and they can drill into a process or disk to see its details.

**Why this priority**: The dashboard already summarizes resource status. This area adds depth for diagnosis.

**Independent Test**: Open the system area and confirm that CPU, memory, and storage values are shown with capacity context and threshold indicators, then open a process's detail.

**Acceptance Scenarios**:

1. **Given** the system area, **When** the user views it, **Then** CPU, memory, and storage usage are shown relative to capacity (for example percentage plus absolute values), with a clear indicator when a value crosses a warning or critical threshold.
2. **Given** the process list, **When** the user views it, **Then** they can sort and search processes and open one to see its details.
3. **Given** the system area is open, **When** time passes, **Then** values refresh periodically, the time of the last update is shown, and the user can refresh on demand or pause automatic refresh.
4. **Given** a metric that the IRIS management capabilities do not expose on the current platform, **When** the area loads, **Then** that metric is marked "not available on this instance" rather than shown as zero.

---

### User Story 7 - Manage credentials and secrets safely (Priority: P3)

An administrator reviews the security resources defined on the instance: credentials, X.509 credentials, wallets, OAuth configurations, and secrets. They create a credential for an outbound connection, update its password, check which X.509 certificates expire soon, and remove an unused credential, and at no point does the portal display a stored secret value.

**Why this priority**: This is a named contest area and important for safety. It is used less often than the areas above.

**Independent Test**: Create a credential with a password, confirm that the password never appears in any view afterward, update it, and delete it after confirming.

**Acceptance Scenarios**:

1. **Given** the security resources area, **When** the user opens it, **Then** credentials, X.509 credentials, wallets, OAuth configurations, and secrets each have their own section, and each section shows only non-sensitive identifying attributes in its list.
2. **Given** a stored secret value (password, private key, client secret, secret content), **When** the user views the resource at any time after it is saved, **Then** the value is never displayed. The portal only shows that a value is set.
3. **Given** a form field that accepts a secret value, **When** the user types into it, **Then** the input is masked by default, the field is marked as sensitive, and the entered value is not kept by the portal after the operation completes.
4. **Given** an X.509 credential, **When** the user views it, **Then** they see its subject, issuer, and validity period, and certificates that are expired or expire within 30 days are flagged.
5. **Given** a security resource type that the IRIS management capabilities do not support modifying, **When** the user views it, **Then** it is presented as read-only and create/edit/delete actions are not offered.

---

### User Story 8 - Explore the management APIs (Priority: P4)

A technical user wants to understand what management operations IRIS exposes. They browse the available management operations grouped by area, read what each does and what inputs it needs, fill in parameters through a form, send read-only requests, and see the response formatted clearly.

**Why this priority**: This rounds out the "REST API management" area and helps with discoverability. It is optional for a focused contest submission and is built only after the core areas are done.

**Independent Test**: Choose a read-only management operation, fill in its parameters through the form, run it, and confirm that the formatted response is shown.

**Acceptance Scenarios**:

1. **Given** the API explorer, **When** the user browses it, **Then** operations are grouped by management area and each shows a description, its inputs, and whether it is read-only or state-changing.
2. **Given** a read-only operation, **When** the user runs it, **Then** the response is displayed in a readable, structured form along with its outcome status.
3. **Given** a state-changing operation, **When** the user runs it, **Then** a confirmation describing the operation and its target is shown before execution.
4. **Given** an operation response containing sensitive fields, **When** it is displayed, **Then** those fields are masked.

---

### Edge Cases

- **Instance unreachable**: IRIS stops responding during a session. Every area shows a connection-problem state with a retry action instead of blank or stale content presented as current.
- **Session expiry**: The session expires while the user is filling in a form. The user is told that the session expired and is asked to sign in again. Wherever possible they return to where they were, and the non-sensitive values they entered are kept.
- **Insufficient privileges**: The signed-in user lacks the privilege to view an area or perform an action. The portal shows a permission-denied state that names the missing capability in plain language when it can be determined. It does not show a generic failure.
- **Concurrent modification**: An entity is changed or deleted by someone else while a user is viewing or editing it. On save the user is told that the entity changed or no longer exists, and the view refreshes to its current state.
- **Large data volumes**: The instance has thousands of users, tasks, processes, or log entries. Lists stay usable through search, filtering, and incremental loading, and a list is never truncated silently.
- **Self-lockout**: The user changes their own user, their own roles, or the web application serving the portal. A specific warning explains the risk of losing access.
- **In-use resource removal**: The user deletes a role that is assigned to users, a credential referenced elsewhere, or a web application in use. The confirmation states the known impact. When the impact can't be determined, it says so.
- **Protected/system entities**: Predefined roles, system web applications, and system tasks that IRIS protects are marked as system entities. Actions IRIS won't allow on them are unavailable, and the reason is shown.
- **Partial success**: A multi-step operation, such as creating a user and then assigning several roles, fails partway through. The user sees which steps succeeded and which failed, and the resulting state.
- **Unsupported capability**: The connected IRIS version does not expose a management capability. The area or action is marked "not supported by this instance". It is never shown broken or empty.
- **Time zones**: Timestamps are shown with an unambiguous time-zone indication, so log times and task schedules can be compared with each other.
- **Task already running**: The user runs a task that is already running, or disables it mid-run. The portal explains the current state and what the action will do.

## Requirements *(mandatory)*

### Functional Requirements

#### General and Access

- **FR-001**: The portal MUST require users to authenticate with their existing IRIS credentials before any management information is shown. It MUST NOT maintain a separate user account store of its own.
- **FR-002**: The portal MUST respect the signed-in user's IRIS privileges. Information and actions the user is not authorized for MUST either be unavailable or produce a clear permission-denied state.
- **FR-003**: The portal MUST show which user is signed in and which IRIS instance (name/host and version where available) it is connected to.
- **FR-004**: Users MUST be able to sign out, ending their session.
- **FR-005**: The portal MUST be a functional application operating on a live IRIS instance, not a static mockup or demonstration of sample data.

#### Navigation and Information Architecture

- **FR-006**: The portal MUST provide persistent navigation to the dashboard and to each management area: Permissions (Users, Roles, Resources), Web Applications, Security Resources, Tasks, System, and Logs (plus API Explorer if delivered).
- **FR-007**: The portal MUST show where the user currently is, both by highlighting the active area in navigation and by showing a location trail (breadcrumb) in detail views.
- **FR-008**: Every list item MUST lead to its detail view, and detail views MUST let users return to the list with its previous search, filter, sort, and position preserved.
- **FR-009**: Every view MUST have a stable, shareable address so that reloading or opening it directly shows the same view (subject to sign-in and authorization).
- **FR-010**: Navigation labels and grouping MUST use IRIS administration concepts (such as "Users", "Roles", "Web Applications", "Scheduled Tasks"), not the names of underlying management endpoints.
- **FR-011**: The portal MUST work on desktop, tablet, and mobile viewport sizes, adapting its navigation to the available space.

#### Dashboard

- **FR-012**: The dashboard MUST summarize system resource status (CPU, memory, storage), with each value shown against warning/critical thresholds.
- **FR-013**: The dashboard MUST summarize task health, including counts of tasks that failed their last run and tasks that are suspended.
- **FR-014**: The dashboard MUST show recent error and warning events with counts, and let the user open the underlying entries.
- **FR-015**: The dashboard MUST surface security and configuration items that need attention, at minimum X.509 certificates that are expired or expire within 30 days, when that information is available.
- **FR-016**: Every dashboard item MUST link to the corresponding area or detail view.
- **FR-017**: Each dashboard section MUST load and fail independently, so that one unavailable data source does not prevent the rest of the dashboard from displaying.
- **FR-018**: The dashboard MUST favor actionable information and show items needing attention before routine information. It MUST NOT try to show every available metric.

#### Permission Management

- **FR-019**: Users MUST be able to list, search, and view IRIS users, including enabled state, assigned roles, and descriptive attributes.
- **FR-020**: Users MUST be able to list, search, and view roles, including description, granted privileges, included roles, and the users that hold the role.
- **FR-021**: Users MUST be able to view resources and see which roles grant which permissions (such as Read, Write, Use) on each resource.
- **FR-022**: For a given user, the portal MUST show effective privileges and, for each privilege, which role(s) grant it.
- **FR-023**: Users MUST be able to create, update, enable/disable, and delete users, and create, update, and delete roles, where the IRIS management capabilities support these operations.
- **FR-024**: Users MUST be able to assign roles to and remove roles from a user, and grant privileges to and revoke privileges from a role, where supported.
- **FR-025**: The portal MUST mark predefined/system security entities and prevent actions that IRIS does not allow on them, showing the reason.
- **FR-026**: The portal MUST warn before any change that could remove the signed-in user's own administrative access.

#### Web Application and REST API Management

- **FR-027**: Users MUST be able to list web applications with path, type, enabled state, namespace, and system/user-defined indication, and filter and search the list.
- **FR-028**: Users MUST be able to view a web application's configuration grouped into understandable sections, with read-only fields visually and semantically distinguished from editable ones.
- **FR-029**: Users MUST be able to create, update, enable/disable, and delete web applications where supported.
- **FR-030**: For REST web applications, the portal MUST show the application's REST configuration (dispatch handler, authentication methods, and related settings) and, when it can be determined, the list of endpoints with HTTP method and path.
- **FR-031**: The portal MUST warn before any change to the web application that serves the portal itself.
- **FR-032**: The portal SHOULD provide an API explorer that lists available management operations by area, describes their inputs, lets users run them through forms, displays responses in structured form, requires confirmation for state-changing operations, and masks sensitive fields in responses.

#### Security and Secrets Management

- **FR-033**: The portal MUST provide sections for credentials, X.509 credentials, wallets, OAuth configurations, and secrets, each listing resources by their non-sensitive identifying attributes.
- **FR-034**: Users MUST be able to inspect, create, update, enable/disable, and delete these resources where the IRIS management capabilities support it. Unsupported operations MUST NOT be offered.
- **FR-035**: The portal MUST NOT display stored secret values (passwords, private keys, client secrets, secret contents) after they are saved. It MUST indicate only whether a value is set.
- **FR-036**: Secret input fields MUST be masked by default, clearly marked as sensitive, and cleared by the portal once the operation completes.
- **FR-037**: The portal MUST NOT store secret values persistently on the user's device and MUST NOT include them in the portal's own diagnostic output.
- **FR-038**: For X.509 credentials, the portal MUST show subject, issuer, and validity period, and flag certificates that are expired or expire within 30 days.
- **FR-039**: Operations that create or change sensitive values MUST be identified as such in the interface before submission.

#### Task Management

- **FR-040**: Users MUST be able to list and search tasks with name, namespace, enabled/suspended state, schedule summary, last run time and result, and next scheduled run.
- **FR-041**: Schedules MUST be described in plain language (for example "Every Monday at 03:00") in addition to any detailed schedule fields.
- **FR-042**: Users MUST be able to view task details, including configuration, schedule, and the run history available from IRIS.
- **FR-043**: Users MUST be able to enable, disable, and run tasks on demand, where supported. Running a task MUST require confirmation.
- **FR-044**: Users MUST be able to create, update, and delete tasks where supported. System tasks that cannot be deleted MUST be marked as such.
- **FR-045**: Tasks whose last run failed MUST be visually highlighted, and the failure details MUST be available.

#### Operating System Management

- **FR-046**: The portal MUST show CPU, memory, and disk/storage usage relative to capacity, with warning and critical threshold indicators.
- **FR-047**: The portal MUST show processes, with sorting, searching, and a detail view.
- **FR-048**: The portal MUST show devices and any other operating-system information exposed by the IRIS management capabilities.
- **FR-049**: Operational values MUST refresh periodically, show the time of the last update, and support manual refresh and pausing of automatic refresh.
- **FR-050**: Metrics that are unavailable on the instance MUST be shown as unavailable, never as zero or blank.
- **FR-051**: The operating-system area is read-only in this release. It MUST NOT offer actions that change processes, devices, or host state.

#### Logs and Operational Events

- **FR-052**: Users MUST be able to choose among the available IRIS log sources.
- **FR-053**: Each log entry MUST show timestamp, and severity and source/subsystem where the underlying information provides them.
- **FR-054**: Users MUST be able to search log entries by text and filter by severity and time range, with active filters visible and individually removable.
- **FR-055**: Users MUST be able to open a log entry to see its full content without losing their list position or filters.
- **FR-056**: Informational, warning, and error entries MUST be visually distinguished, and not by color alone.
- **FR-057**: Filters that don't apply to a log source (for example severity where none exists) MUST be unavailable for that source.

#### Data and Operation States

- **FR-058**: Every view MUST distinctly represent: loading, empty (no data exists), no results (filters match nothing), success, validation error, permission denied, resource not found/unavailable, server or connection error, partially available information, and not supported by this instance.
- **FR-059**: Recoverable error states MUST offer a relevant recovery action (such as retry, clear filters, or return to list).
- **FR-060**: Errors returned by IRIS MUST be translated into plain-language messages that state what failed and, when known, why and what the user can do. Original technical details MUST remain available on demand.
- **FR-061**: An unexpected failure within one area MUST NOT make the rest of the portal unusable, and the user MUST be offered a way to recover.

#### Validation and User Feedback

- **FR-062**: Forms MUST validate user input before submission (required fields, formats, lengths, allowed values) and show field-level messages next to the relevant fields.
- **FR-063**: Validation and business-rule errors returned by IRIS MUST be shown next to the related fields when they can be associated with a field, and as a form-level message otherwise.
- **FR-064**: After every state-changing operation, the portal MUST tell the user what operation was attempted, whether it succeeded or failed, and whether the resulting state changed, and MUST show the current state of the affected entity.
- **FR-065**: Submitting a form MUST prevent duplicate submission while the operation is in progress.
- **FR-066**: If the user leaves a form with unsaved changes, the portal MUST ask for confirmation before discarding them.

#### Safety of Administrative Operations

- **FR-067**: State-changing actions MUST be visually distinguishable from read-only navigation and inspection, and destructive actions MUST be distinguishable from other state-changing actions.
- **FR-068**: Destructive or high-impact actions (delete, disable, revoke, run task, change security configuration) MUST require explicit confirmation that names the target entity and describes the consequence and any known impact.
- **FR-069**: Irreversible deletions of significant entities (users, roles, web applications, security resources) MUST require a deliberate confirming action beyond a single default-focused button. For these, the initial focus in the confirmation MUST NOT be on the destructive option.
- **FR-070**: The portal MUST NOT perform any state-changing operation as a side effect of navigation or of viewing information.

#### Accessibility and Usability

- **FR-071**: The portal MUST use a semantic structure (landmarks, headings, lists, tables with headers, labeled form controls).
- **FR-072**: Every interaction MUST be operable using a keyboard alone, with a visible focus indicator.
- **FR-073**: Focus MUST be managed sensibly. It moves into dialogs when they open, returns to the triggering element when they close, and moves to the first invalid field or the error summary when validation fails.
- **FR-074**: Status changes, operation results, and validation messages MUST be announced to assistive technologies.
- **FR-075**: Information MUST NOT be conveyed by color alone. Status and severity MUST also use text or icons.
- **FR-076**: The portal MUST meet WCAG 2.2 Level AA for its core workflows.
- **FR-077**: All user-facing text MUST use understandable labels. Where IRIS-specific terms are unavoidable, a short explanation MUST be available.
- **FR-078**: All user-facing text MUST be translatable. English is the delivered language for this release.

#### Contest and Documentation

- **FR-079**: The project MUST include documentation that explains the product's purpose, its capabilities per management area, its prerequisites, how to install and run it against an IRIS instance, and how to use its main workflows.
- **FR-080**: The project MUST be publishable as open source under its existing Apache 2.0 license, and MUST contain no credentials or instance-specific secrets.
- **FR-081**: The project MUST provide a repeatable way for evaluators to run the portal against an IRIS instance with minimal setup.

### Key Entities

- **User**: An IRIS account. It has a name, full name, enabled state, descriptive attributes, and assigned roles. It is related to Roles (many-to-many).
- **Role**: A named set of privileges. It has a description, granted privileges, included roles, and holders (Users). It can be predefined (system) or user-defined.
- **Resource**: A protected IRIS asset (database, service, application, or administrative resource) on which permissions are granted.
- **Privilege**: A pairing of a Resource with one or more permissions (such as Read, Write, Use) granted by a Role.
- **Web Application**: A URL path configuration. It has a type (REST, web pages, other), namespace, enabled state, authentication settings, dispatch configuration, and system/user-defined flag.
- **REST Endpoint**: A method-and-path route exposed by a REST Web Application, with a handler or description when available.
- **Credential**: A named identity with a username and a secret value (never displayed), used for outbound connections.
- **X.509 Credential**: A certificate with an optional private key (never displayed). It has a subject, issuer, validity period, and expiry status.
- **Wallet**: A container for secure keys or certificates, identified by name. Its sensitive contents are never displayed.
- **OAuth Configuration**: An OAuth client or server definition with identifying and endpoint attributes. Its client secrets are never displayed.
- **Secret**: A named stored sensitive value. Its value is never displayed.
- **Task**: A scheduled job. It has a name, namespace, enabled/suspended state, schedule, and system/user-defined flag, and it has Task Runs.
- **Task Run**: One execution of a Task, with start/end time, result (success/failure), and error details.
- **Process**: A running IRIS process with an identifier, state, and resource usage attributes.
- **System Metric**: A measured operational value (CPU, memory, storage, device) with capacity, current value, threshold status, and measurement time.
- **Log Source**: A named IRIS log or event stream. It indicates which attributes (severity, source) it provides.
- **Log Entry**: One logged event, with timestamp, severity (optional), source/subsystem (optional), message, and full details.
- **Operation Result**: The outcome of an administrative action. It records the operation attempted, the target, success/failure, a plain-language message, technical details, and whether the state changed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user who knows IRIS can start from the dashboard and reach any of the six management areas in at most 2 interactions, and can return to the dashboard from any view in 1 interaction.
- **SC-002**: An administrator can determine which role(s) give a specific user a specific privilege in under 1 minute, without leaving the portal or consulting another tool.
- **SC-003**: An operator can find a specific error event from the last 24 hours, using filtering and search, in under 30 seconds.
- **SC-004**: An administrator can create a user, assign a role, and confirm the resulting effective privileges in under 3 minutes.
- **SC-005**: 100% of destructive actions (deletions, disables, revocations, task runs) require an explicit confirmation that names the target entity.
- **SC-006**: 0 stored secret values are displayed anywhere in the portal after being saved, as verified by inspecting every security resource view and the API explorer.
- **SC-007**: For at least 90% of failures returned by IRIS during testing, the portal shows a plain-language message that states what failed. It does not show only a raw technical response.
- **SC-008**: The dashboard shows its first meaningful content within 3 seconds of sign-in on a typical instance, and every section has either loaded or shown its own unavailable state within 10 seconds.
- **SC-009**: Every view displays a distinct, identifiable state for loading, empty, and error conditions. No view shows a blank area where content failed to load.
- **SC-010**: The core workflows (sign in, review dashboard, inspect a user's effective privileges, run a task, filter logs, create and delete a web application) can be completed using the keyboard alone, and an automated accessibility check reports no critical or serious violations on these views.
- **SC-011**: A new evaluator can follow the project documentation and have the portal running against an IRIS instance in under 15 minutes.
- **SC-012**: In a walkthrough of the core workflows, at least 4 out of 5 IRIS-familiar test users rate the portal as easier to use than the native Management Portal for the same tasks.

## Assumptions

- **Single instance**: The portal manages one IRIS instance, the one it is connected to. Managing or comparing multiple instances is out of scope.
- **Authentication and authorization**: IRIS is responsible for both. Users sign in with existing IRIS accounts, and what they can see and do is governed by their IRIS roles and privileges. The portal adds no access rules of its own.
- **IRIS capabilities define the boundary**: The portal exposes only what the IRIS management capabilities support. Where a capability is missing on the connected IRIS version, the portal marks it as unsupported instead of working around it.
- **Contest scope over completeness**: The portal is a focused contest submission. It does not reproduce every capability of the native Management Portal, and it offers deep links or references to the native portal for capabilities it does not cover.
- **Operating system area is read-only**: Terminating processes or changing host or device settings is out of scope for this release.
- **API Explorer is optional**: User Story 8 (P4) is built only after the higher-priority stories are complete.
- **Default thresholds**: Resource thresholds default to warning at 80% and critical at 90% usage. Certificate expiry warnings default to 30 days.
- **Refresh interval**: Operational values refresh automatically every 15 seconds by default.
- **Log history**: The history the portal can show is limited to what IRIS retains. The portal does not archive logs itself.
- **Language**: English is the delivered interface language. Text is structured so it can be translated later.
- **Supported browsers**: The current versions of the major evergreen desktop and mobile browsers are supported.
- **Audience**: Users are technically literate and familiar with basic IRIS concepts (namespaces, roles, web applications). The portal explains IRIS-specific terms but does not teach IRIS from scratch.

### Out of Scope

**Technical decisions deferred to planning**: This specification deliberately does not decide the technology stack, application architecture, deployment architecture, programming languages, frameworks, libraries, project structure, or implementation approach. Those belong to the planning phase and must follow the project constitution (`.specify/memory/constitution.md`).

**Functional exclusions for this release**:

- Management of multiple IRIS instances, mirroring, or clusters.
- Namespace, database, and journal configuration beyond what the in-scope areas need to display.
- Interoperability production management.
- SQL query execution, class/routine editing, or code deployment.
- Terminating processes or changing operating-system settings.
- Custom alerting, notifications to external channels, or historical metric storage and trending beyond what IRIS provides.
- A portal-specific user, role, or permission model separate from IRIS security.
