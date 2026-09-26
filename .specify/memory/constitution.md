<!--
Sync Impact Report
==================
Version change: (unversioned template) → 1.0.0
Bump rationale: First ratification. The placeholder template is replaced by a concrete
constitution, so this is the initial MAJOR baseline.

Modified principles (template placeholder → adopted principle):
  - [PRINCIPLE_1_NAME] → I. Simplicity First
  - [PRINCIPLE_2_NAME] → II. Feature-Based Architecture
  - [PRINCIPLE_3_NAME] → III. Established Technology Stack
  - [PRINCIPLE_4_NAME] → IV. Clear Separation of Responsibilities
  - [PRINCIPLE_5_NAME] → V. Server State and Client State

Added principles:
  - VI. Direct IRIS API Integration
  - VII. API Contract as Source of Truth
  - VIII. Validation and Error Handling
  - IX. Contextual User Feedback
  - X. Accessibility by Default
  - XI. Responsive and Adaptive UI
  - XII. Security Boundaries
  - XIII. IRIS-Centric Deployment
  - XIV. Client-Side Rendering
  - XV. Testing by Responsibility
  - XVI. Observability and Error Recovery
  - XVII. Progressive Optimization
  - XVIII. Consistency Over Novelty
  - XIX. AI-Assisted Development
  - XX. Explicit Architectural Decisions

Added sections:
  - Preamble (introductory text under the title)

Removed sections:
  - [SECTION_2_NAME] / [SECTION_3_NAME]: not defined by the source document. Stack,
    deployment, and workflow constraints are already covered by Principles III, XIII,
    XIV, XIX and XX, so separate sections would duplicate them.

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md: Constitution Check now lists the gates
    derived from Principles I–XX.
  - ✅ .specify/templates/spec-template.md: no change required (technology-agnostic).
  - ✅ .specify/templates/tasks-template.md: no change required ("tests optional" is
    compatible with Principle XV, which prioritizes meaningful behavior over coverage).
  - ⚠ .specify/templates/plan-template.md "Source Code" options: Option 2 shows a
    `backend/` project and layered `models/services/` folders. /speckit-plan MUST
    select a frontend-only, feature-based layout (Principles II and VI). The template
    was left unchanged because it is Spec Kit-managed.
  - ✅ .specify/templates/commands/*.md: directory not present; nothing to check.
  - ⚠ CLAUDE.md: still says "No build system, framework, or source code has been
    established". Update it once the stack from Principle III is scaffolded.
  - ✅ README.md: no principle references; no change required.

Follow-up TODOs:
  - "Technical documentation" (referenced by Principles III, XIX, XX and Governance)
    does not exist yet. Create it, e.g. under docs/architecture/, when the first
    architectural decision is recorded.
-->

# iris-converge Constitution

This constitution defines the fundamental engineering principles and mandatory architectural
constraints for the project.

AI coding agents and human contributors MUST follow these principles when designing,
implementing, reviewing, or modifying the application.

When a new requirement conflicts with an existing constitutional principle, the conflict MUST be
explicitly identified and the constitutional principle MUST NOT be silently bypassed.

## Core Principles

### I. Simplicity First

The project MUST favor simple, understandable, and maintainable solutions.

- Implement the simplest solution that satisfies the requirement.
- Avoid premature abstraction.
- Avoid introducing infrastructure that does not provide clear value.
- Do not introduce a library, framework, pattern, or architectural component solely because it
  is commonly used.
- Prefer existing project capabilities over introducing new dependencies.
- New abstractions MUST be justified by a real and recurring need.

### II. Feature-Based Architecture

The frontend MUST follow a feature-based architecture.

- Features represent functional capabilities of the application.
- Code related to a feature SHOULD remain within that feature.
- Shared code MUST only be extracted when there is a genuine reuse requirement.
- Technical layers MUST NOT be created prematurely merely to enforce architectural symmetry.
- Architecture SHOULD evolve incrementally as the application grows.

Technical layers MUST NOT be introduced without a concrete responsibility or demonstrated need.

### III. Established Technology Stack

The application MUST use the technologies and libraries defined by the project's technical
decisions.

The frontend stack is based on:

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- TanStack Table
- TanStack Form
- Zod
- Fetch API
- shadcn/ui
- Tailwind CSS
- Lucide React
- i18next

Alternative libraries MUST NOT be introduced to replace an established technology without an
explicit architectural decision.

Dependencies MUST be added only when they provide clear value that cannot reasonably be achieved
with the existing stack.

### IV. Clear Separation of Responsibilities

Each part of the application MUST have a clearly defined responsibility.

- UI components MUST focus on presentation and user interaction.
- Feature code MUST contain feature-specific behavior.
- Shared utilities MUST contain genuinely reusable functionality.
- Server state MUST be handled separately from local UI state.
- API communication MUST be centralized.
- Data transformation MUST be explicit.

Code MUST NOT duplicate responsibilities across multiple architectural boundaries.

### V. Server State and Client State

Server state and client state MUST be treated as different concerns.

**Server state**: TanStack Query MUST be used to manage server state, including fetching,
caching, synchronization, refetching, invalidation, loading states, and server errors. Server
state MUST NOT be duplicated unnecessarily in React Context or another client-side state
mechanism.

**Client state**: Local UI state MUST use React state. React Context MAY be used when state
genuinely needs to be shared across unrelated components. A dedicated global state management
library MUST NOT be introduced without an explicit architectural decision.

### VI. Direct IRIS API Integration

The frontend MUST communicate directly with the InterSystems IRIS REST API.

A custom backend, BFF, API gateway, or intermediary application layer MUST NOT be introduced
unless explicitly required by the project.

All frontend HTTP communication MUST go through the shared HTTP client. Feature code MUST NOT
directly implement independent HTTP communication mechanisms.

### VII. API Contract as Source of Truth

The InterSystems IRIS API contract MUST be treated as the source of truth for API data
structures.

- API DTOs SHOULD represent the API contract.
- Frontend-specific models SHOULD only be introduced when an actual transformation or
  domain-specific representation is required.
- Data transformations MUST be explicit.
- Mappers MUST remain separate from UI components.

The frontend MUST NOT silently redefine API semantics.

### VIII. Validation and Error Handling

Validation MUST occur at the appropriate boundaries.

**Client-side validation**: The frontend MUST validate user input to provide immediate and
useful feedback. Zod SHOULD be used for schema validation.

**Server-side validation**: InterSystems IRIS remains the final authority for API validation.
The frontend MUST correctly handle validation errors returned by IRIS. Client-side validation
MUST NOT be considered a replacement for server-side validation.

**Error handling**: HTTP and API errors MUST be normalized by the shared HTTP client. Components
SHOULD consume normalized errors rather than implementing independent HTTP error parsing.

### IX. Contextual User Feedback

User feedback MUST reflect the type and context of the operation.

The application SHOULD use:

- loading indicators or skeletons for loading states
- dedicated empty states when no data exists
- error states for recoverable errors
- toast notifications for successful transient actions
- AlertDialog for destructive confirmations
- field-level feedback for validation errors

Different feedback mechanisms MUST NOT be mixed without a clear UX reason.

### X. Accessibility by Default

Accessibility MUST be considered part of the implementation, not a later enhancement.

The application MUST:

- use semantic HTML whenever appropriate
- use accessible shadcn/ui components
- maintain meaningful keyboard interaction
- provide appropriate labels and accessible names
- avoid unnecessary custom accessibility implementations

ESLint accessibility rules MUST be used to identify common accessibility problems.

### XI. Responsive and Adaptive UI

The application MUST use a single responsive implementation rather than separate desktop and
mobile applications.

Components SHOULD adapt to the available viewport using responsive layout techniques.

The application SHOULD support:

- desktop layouts with a sidebar
- collapsed navigation on smaller desktop/tablet layouts
- drawer-based navigation on mobile devices

Responsive behavior MUST NOT require duplicating entire feature implementations.

### XII. Security Boundaries

The portal MUST NOT implement its own authentication mechanism. Access control and
authentication responsibilities are delegated to the execution environment and the InterSystems
IRIS infrastructure.

Frontend configuration MUST NOT contain secrets. Vite environment variables prefixed with
`VITE_` MUST be treated as public information because they are embedded into the frontend
build.

Credentials, tokens, passwords, private keys, and other secrets MUST NOT be included in frontend
source code or build-time public configuration.

### XIII. IRIS-Centric Deployment

InterSystems IRIS is the target runtime environment for the application.

The React application MUST be built as static assets and served by the IRIS environment. The
deployment SHOULD favor a simple IRIS-centric architecture.

A separate web server such as Nginx MUST NOT be introduced solely to serve the frontend unless
the deployment environment explicitly requires it.

The frontend and IRIS REST API SHOULD use the same origin whenever practical.

### XIV. Client-Side Rendering

The frontend MUST use client-side rendering. The application MUST NOT introduce SSR or SSG
infrastructure unless an explicit requirement justifies it.

Vite MUST produce the production frontend assets.

Client-side routes MUST be supported by the IRIS hosting configuration through the appropriate
SPA fallback behavior.

### XV. Testing by Responsibility

Testing MUST reflect the responsibility and risk of the code being tested.

The project SHOULD follow a testing pyramid:

- unit tests for isolated logic, rules, and transformations
- component tests for component behavior and interaction
- integration tests for interactions between application parts and external boundaries
- E2E tests for critical end-to-end user journeys

Testing MUST prioritize meaningful behavior over arbitrary coverage percentages.

### XVI. Observability and Error Recovery

Application errors MUST be handled in a controlled manner.

The application MUST provide a global error boundary capable of:

- preventing an unhandled rendering error from breaking the entire application
- logging the error through the application logger
- presenting a user-friendly recovery experience

Application logging SHOULD use the project's shared logger rather than scattered direct
`console` calls.

### XVII. Progressive Optimization

Performance optimizations MUST be driven by actual needs and measurable evidence.

The project SHOULD initially rely on Vite and framework defaults. Route and feature-level code
splitting SHOULD be used where appropriate.

Additional bundle optimization, caching mechanisms, or infrastructure MUST NOT be introduced
without evidence that they solve an actual performance problem.

TanStack Query MUST be considered the application's server-state cache. A separate caching
system MUST NOT be introduced without an explicit architectural decision.

### XVIII. Consistency Over Novelty

When implementing a new feature, contributors and AI agents MUST prefer established project
patterns over introducing new approaches.

Before introducing a new pattern, abstraction, dependency, or architectural mechanism, the
implementation SHOULD verify whether an existing project capability already solves the problem.

The project SHOULD evolve toward a coherent codebase rather than accumulating multiple valid but
inconsistent approaches.

### XIX. AI-Assisted Development

AI-generated code MUST conform to this constitution and the project's technical documentation.

AI agents MUST:

- follow established architectural boundaries
- reuse existing components and utilities when appropriate
- avoid introducing unnecessary dependencies
- avoid creating abstractions without demonstrated need
- preserve existing conventions
- identify uncertainty instead of inventing API behavior
- avoid modifying architectural decisions implicitly
- keep changes focused on the requested requirement

When an implementation requires violating a constitutional principle, the conflict MUST be
explicitly surfaced before proceeding.

### XX. Explicit Architectural Decisions

Architectural decisions MUST be explicit.

AI agents and contributors MUST NOT silently change:

- the technology stack
- architectural style
- API communication strategy
- state-management strategy
- deployment architecture
- authentication model
- security boundaries

Changes to these areas require an explicit architectural decision and MUST be reflected in the
project's technical documentation.

## Governance

This constitution is the highest-level engineering guideline for the project.

When implementing a feature:

1. The constitution defines the non-negotiable principles.
2. Technical documentation defines the concrete technology and architectural decisions.
3. Feature specifications define the functional requirements.
4. Implementation follows the specification while respecting the constitution and technical
   decisions.

If two project documents conflict, the higher-level rule MUST take precedence unless the
conflict is explicitly resolved through an architectural decision.

**Amendments**: The constitution SHOULD remain stable. Changes MUST be intentional, documented,
and reviewed as architectural decisions. Each amendment MUST update the Sync Impact Report at the
top of this file and propagate to dependent templates in `.specify/templates/`.

**Versioning**: The constitution follows semantic versioning:

- MAJOR: backward-incompatible removal or redefinition of a principle or governance rule.
- MINOR: a new principle or section, or materially expanded guidance.
- PATCH: clarifications, wording, and typo fixes with no semantic change.

**Compliance review**: Every implementation plan MUST pass the Constitution Check gate in
`plan.md` before research and again after design. Any violation MUST be recorded and justified
in the plan's Complexity Tracking table. Code reviews MUST verify compliance with these
principles.

**Version**: 1.0.0 | **Ratified**: 2026-09-26 | **Last Amended**: 2026-09-26
