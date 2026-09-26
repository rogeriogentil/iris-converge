Create a product specification for a web-based management portal for InterSystems IRIS, developed as an entry for the InterSystems Programming Contest "Build Your Own Management Portal".

The goal is to provide a modern, focused, and user-friendly alternative interface for managing and monitoring an InterSystems IRIS instance through the management capabilities exposed by IRIS.

Do not define or prescribe the technology stack, application architecture, deployment architecture, programming languages, frameworks, libraries, project structure, or implementation approach in this specification. Those decisions will be addressed separately during the planning phase.

## Product Goal

Build a management portal that consolidates frequently used IRIS administration and operational activities into a coherent user experience.

The portal should prioritize:

* clarity of information;
* efficient administrative workflows;
* discoverability of IRIS management capabilities;
* consistent user experience across different management areas;
* useful operational visibility;
* safe execution of administrative actions;
* meaningful feedback for successful and failed operations.

The portal is intended primarily for IRIS administrators, developers, operators, and technical users who need to inspect, configure, and operate an IRIS instance.

## Functional Scope

The portal must cover the main areas identified by the contest challenge.

### 1. Permission Management

Provide capabilities for managing and inspecting IRIS security and authorization information.

The portal should allow users to:

* view users;
* view roles;
* inspect permissions and privileges;
* inspect relationships between users and roles;
* inspect relationships between roles and permissions;
* create, update, and remove supported security entities when the underlying IRIS management capabilities allow it;
* clearly communicate the effect and result of administrative operations;
* prevent accidental destructive operations through appropriate confirmation.

The interface should make authorization relationships understandable instead of merely exposing raw API data.

### 2. Web Application and REST API Management

Provide capabilities for inspecting and managing IRIS web applications and REST-related configurations.

The portal should allow users to:

* list available web applications;
* inspect the configuration of a web application;
* create, update, enable/disable, and remove supported web applications when supported by the IRIS management capabilities;
* inspect relevant REST API configuration;
* provide an understandable representation of REST endpoints and their configuration;
* clearly distinguish read-only information from information that can be modified.

Where appropriate, the portal should provide an API exploration experience that helps technical users understand and interact with available management APIs without requiring them to work directly with raw HTTP requests.

### 3. Security and Secrets Management

Provide a centralized view for supported IRIS security configuration and secret-related resources.

The portal should cover the management capabilities relevant to:

* credentials;
* X.509 credentials;
* wallets;
* OAuth configuration;
* secrets.

Sensitive information must be handled carefully.

The interface must avoid unnecessarily exposing secret values and should clearly communicate when an operation involves sensitive information.

Where supported, users should be able to inspect, create, update, enable/disable, or remove security resources through the portal.

### 4. Task Management

Provide capabilities for managing scheduled and administrative tasks.

The portal should allow users to:

* list tasks;
* inspect task details;
* identify task status;
* identify scheduling information;
* enable and disable tasks;
* execute supported tasks when appropriate;
* create, update, and remove supported tasks;
* understand the result of task operations.

The task interface should make operational state and scheduling information easy to understand.

### 5. Operating System Management

Provide an operational view of the environment in which IRIS is running.

The portal should expose relevant information about:

* processes;
* CPU usage;
* memory usage;
* disks/storage;
* devices;
* other operating-system information exposed by the supported IRIS management capabilities.

The portal should present this information in a way that helps users quickly understand the current operational state rather than simply displaying raw values.

Where supported by the underlying management capabilities, users should be able to inspect relevant details of operating-system resources.

### 6. Logs and Operational Events

Provide a centralized interface for viewing logs and operational information exposed by IRIS subsystems.

Users should be able to:

* view available log information;
* identify timestamp;
* identify severity or level when available;
* identify the relevant subsystem or source when available;
* search logs;
* filter logs;
* inspect log details;
* distinguish informational, warning, and error events where the underlying information supports this.

The log experience should help users diagnose operational problems efficiently.

## Dashboard and Operational Overview

In addition to the individual management areas above, provide a dashboard that gives users a concise overview of the current IRIS environment.

The dashboard should surface useful operational information such as:

* system resource status;
* relevant task status;
* important security or configuration information;
* recent operational events;
* errors or warnings that deserve attention;
* other meaningful information available through the supported management capabilities.

The dashboard should prioritize actionable information rather than attempting to display every available metric.

## Navigation and Information Architecture

The portal should provide a coherent navigation model covering the management areas.

Users should be able to:

* move easily between major management areas;
* understand where they are in the portal;
* return to the main dashboard;
* access details from summary views;
* return from details to their previous context where appropriate.

The information architecture should reflect the conceptual organization of IRIS administration rather than simply mirroring API endpoint names.

## Data and Operation States

The portal must clearly represent common states, including:

* loading;
* empty results;
* successful operations;
* validation errors;
* authorization or permission errors;
* unavailable resources;
* server/API errors;
* partially available information;
* destructive operations requiring confirmation.

Errors returned by IRIS management operations should be translated into useful information for the user whenever possible rather than being presented only as raw technical responses.

## Validation and User Feedback

User input should be validated before an administrative operation is submitted whenever appropriate.

The portal should also correctly handle validation and business errors returned by the IRIS management capabilities.

The user should receive clear feedback indicating:

* what operation was attempted;
* whether it succeeded or failed;
* what needs to be corrected when applicable;
* whether the resulting state has changed.

## Safety of Administrative Operations

Administrative actions can have significant consequences.

The portal should:

* clearly distinguish read-only operations from state-changing operations;
* require explicit confirmation for potentially destructive actions;
* provide meaningful descriptions for destructive operations;
* avoid accidental execution of irreversible operations;
* avoid exposing sensitive information unnecessarily;
* provide clear feedback after administrative actions.

## Accessibility and Usability

The portal should provide an accessible and usable experience.

Requirements include:

* semantic interface structure;
* keyboard-accessible interactions;
* understandable labels;
* visible and meaningful feedback;
* appropriate handling of focus;
* accessible forms and validation messages;
* understandable status and error information.

The interface should remain usable across the major management workflows without requiring users to understand the underlying API implementation.

## Contest Requirements

The resulting product must satisfy the functional intent of the InterSystems Programming Contest "Build Your Own Management Portal".

The solution should be a functional management portal rather than a static mockup or a simple API demonstration.

The implementation should demonstrate meaningful use of the IRIS management capabilities and provide value beyond merely exposing raw API responses.

The product should be suitable for open-source publication and should include enough documentation for another user to understand the product, its purpose, its capabilities, and how to use it.

## Expected Specification Output

Produce a complete product specification containing:

1. Product overview and goals.
2. Target users and their primary needs.
3. Functional requirements for each management area.
4. User stories and acceptance criteria.
5. Dashboard requirements.
6. Navigation and information architecture requirements.
7. Error, validation, and operational-state requirements.
8. Security and sensitive-data handling requirements.
9. Accessibility and usability requirements.
10. Contest-specific requirements and constraints.
11. Explicitly stated out-of-scope technical decisions.

Prioritize a focused, achievable contest submission over attempting to reproduce every capability of the native IRIS Management Portal.
