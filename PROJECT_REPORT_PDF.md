---
title: Rotator Mode Program Report
subtitle: Password Rotation Platform
version: 1.0
date: 2026-02-05
classification: Confidential
brand: Password Cluster
---

<!-- cover-start -->
# Password Cluster

## Rotator Mode Program Report

[Logo Placeholder: 220px x 220px | SVG or PNG | Primary mark]

**Version:** 1.0

**Date:** 2026-02-05

**Prepared By:** Product Owner, Delivery Manager, Solution Architect, QA Lead, Business Analyst

**Classification:** Confidential

<!-- cover-end -->

<!-- pagebreak -->

## Branding and Print Notes

**Cover Style**
- Background: #F7F3EA (Accent Cream)
- Title font: Fraunces 36pt, color #0E151B
- Subtitle font: IBM Plex Sans 14pt, color #2A3B47
- Logo placement: top-left, 24mm from top, 20mm from left

**Body Style**
- Body font: IBM Plex Sans 10.5pt, color #0E151B
- Heading font: Fraunces 16pt for H2, 13pt for H3
- Page margins: 20mm (top/bottom), 18mm (left/right)
- Line spacing: 1.2 for paragraphs, 1.1 for tables

**Header/Footer Template**
- Header: Rotator Mode Program Report | Confidential
- Footer: Page {PAGE} of {TOTAL} | 2026-02-05

**Section Headers**
- Use numeric section headers as provided (e.g., "1. Project Report")
- Start each main section on a new page

<!-- pagebreak -->

## Document Control

**Header/Footer Guidance**

- Header: Rotator Mode Program Report | Confidential
- Footer: Page {PAGE} of {TOTAL} | 2026-02-05

**Revision History**

| Version | Date | Author | Notes |
| --- | --- | --- | --- |
| 0.1 | 2026-01-15 | Product Owner | Initial outline |
| 0.9 | 2026-01-29 | Delivery Manager | Consolidated inputs |
| 1.0 | 2026-02-05 | Delivery Manager | Release candidate |

**Approvals**

| Role | Name | Status | Date |
| --- | --- | --- | --- |
| Product Owner | TBD | Pending | TBD |
| QA Lead | TBD | Pending | TBD |
| Security Lead | TBD | Pending | TBD |
| Delivery Manager | TBD | Pending | TBD |

**Distribution**

| Audience | Location |
| --- | --- |
| Product and Engineering | Internal |
| QA and Security | Internal |
| Executive Stakeholders | Internal |

<!-- pagebreak -->

## Table of Contents

- 1. Project Report
- 2. Product Requirements
- 3. BA User Stories
- 4. Jira Backlog
- 5. Sprint Plan
- 6. Test Strategy
- 7. Test Cases
- 8. Test Report
- 9. Bug Report
- 10. Solution Architecture
- 11. Developer Guidelines
- 12. Release Notes
- 13. Design and Automation Artifacts

<!-- pagebreak -->
## 1. Project Report

Project Name: Rotator Mode Password Manager
Date: 2026-02-05
Prepared By: Delivery Manager

## Executive Summary
Rotator Mode delivers a secure, local first password manager that can rotate large batches of passwords using a queue and guided automation. The MVP focuses on risk visibility, a rotation queue, guided flows, and verification to confirm old passwords are invalid and new ones work. The release is structured across six sprints with a primary goal of reducing high risk passwords within 30 days of onboarding.

## Scope Delivered
1. Encrypted vault with import from browser and CSV
2. Risk scoring for weak, reused, breached, and old passwords
3. Rotation queue with auto, guided, manual, and blocked modes
4. Guided rotation flows for top 10 sites
5. Browser extension for step execution and MFA handling
6. Verification of password changes
7. Insights dashboard for risk reduction trends
8. Settings for security, sync, and automation policies

## Out of Scope
1. Full enterprise IAM features
2. Fully automated rotation for all sites
3. Cloud storage of raw passwords

## Schedule and Sprints
1. Sprint 0: Foundations and app shell
2. Sprint 1: Vault core and import
3. Sprint 2: Risk engine and dashboard
4. Sprint 3: Rotation queue and agent skeleton
5. Sprint 4: Extension and guided flows
6. Sprint 5: Auto flows and verification
7. Sprint 6: Hardening and polish

## Delivery Status
1. Scope: On track for MVP
2. Schedule: On track with one risk buffer sprint
3. Quality: Requires ongoing automation coverage
4. Security: Zero knowledge and local first confirmed

## Key Metrics
1. 70 percent of new users rotate 10 or more passwords in week 1
2. 60 percent reduction in high risk passwords within 30 days
3. 80 percent success rate on guided flows for top 10 sites
4. Median rotation time under 90 seconds per account

## Risks and Mitigations
1. Automation variance across sites
Mitigation: guided mode and manual fallback
2. Lockouts and rate limits
Mitigation: lockout guard, cooldowns, and safe pause
3. MFA interruptions
Mitigation: explicit MFA waiting state with resume

## Design and UX Deliverables
1. Figma frame list aligned to wireframe spec
2. Design tokens file: design-tokens.json
3. Component inventory file: components.json
4. Visual system with Fraunces and IBM Plex Sans

## Testing Summary
1. Functional, integration, and regression testing planned
2. Automated flow validation for flow templates
3. Security testing includes SAST, dependency scanning, and penetration testing
4. Performance testing covers rotation queue and extension communication

## Release Readiness
1. Entry criteria met for MVP features
2. Known issues tracked in bug report
3. Test exit criteria met with targeted coverage goals

## Stakeholder Sign Off
1. Product Owner approval required
2. Security review approval required
3. QA sign off required

<!-- pagebreak -->
## 2. Product Requirements

Product: Rotator Mode Password Manager
Owner: Product Owner
Date: 2026-02-05

## Problem Statement
Users manage dozens or hundreds of passwords. Many are weak, reused, or breached. Rotating passwords is slow because each site has different flows and often requires MFA. Users need a single place to rotate many passwords quickly without sacrificing security.

## Goals
1. Reduce high risk passwords quickly
2. Make bulk rotation possible with minimal effort
3. Preserve zero knowledge security and local first storage

## Non Goals
1. Full enterprise IAM features
2. 100 percent automation coverage at launch
3. Cloud storage of raw passwords

## Target Users
1. Security conscious power users
2. Freelancers and small teams
3. IT administrators with many personal accounts

## Key Features
1. Encrypted local vault with import and search
2. Risk scoring and risk center
3. Rotation queue with prioritized modes
4. Guided rotation flows and auto flows for top sites
5. Verification that password changes succeeded
6. Browser extension with MFA handling
7. Insights dashboard and rotation history

## Success Metrics
1. 70 percent of new users rotate 10 or more passwords in week 1
2. 60 percent reduction in high risk passwords within 30 days
3. 80 percent success rate on guided flows for top 10 sites
4. Median rotation time under 90 seconds

## User Journey Summary
1. Onboard and create master key
2. Import credentials
3. Review risk center and queue
4. Run Rotator Mode
5. Verify changes
6. Maintain ongoing hygiene

## Constraints
1. Zero knowledge encryption
2. Local first by default
3. Automation must pause on captcha and lockout risk

<!-- pagebreak -->
## 3. BA User Stories

## Epic RM-E1 Onboarding and Vault

Story RM-101: Import credentials from browser
As a user, I want to import credentials from my browser so that I can start with all my existing accounts.
Acceptance Criteria
AC1: User can import from Chrome and Safari
AC2: Import shows a summary of items added and skipped
AC3: Import handles duplicates using merge rules

Story RM-102: Create master key
As a user, I want to set a master key so that my vault is secured.
Acceptance Criteria
AC1: User must confirm master key before continuing
AC2: Strength meter and warnings are shown for weak keys
AC3: Recovery key can be generated

Story RM-103: Search and filter vault
As a user, I want to search and filter my vault so that I can quickly find accounts.
Acceptance Criteria
AC1: Search returns results under 150ms for 1000 entries
AC2: Filters include risk type and rotation status
AC3: Search and filters can be combined

## Epic RM-E2 Risk and Insights

Story RM-201: View risk center
As a user, I want to see my risk summary so that I understand what needs attention.
Acceptance Criteria
AC1: Risk counts show breached, reused, weak, and old
AC2: Risk score updates after import and rotations
AC3: Clicking a risk type filters the list

Story RM-202: Detect reused passwords
As a user, I want reuse detection so that I can fix the most risky patterns.
Acceptance Criteria
AC1: Reuse detection runs after import
AC2: Reused accounts are flagged consistently
AC3: Reuse status updates after rotation

Story RM-203: Insights dashboard
As a user, I want to see improvement metrics so that I can track progress.
Acceptance Criteria
AC1: Shows weekly rotations
AC2: Shows risk reduction trend
AC3: Shows rotation success rate

## Epic RM-E3 Rotation Queue and Flows

Story RM-301: Build rotation queue
As a user, I want a prioritized queue so that I can rotate the most risky accounts first.
Acceptance Criteria
AC1: Queue prioritizes breached and reused passwords
AC2: User can skip or reorder items
AC3: Queue shows mode per account

Story RM-302: Guided rotation flow
As a user, I want guided steps so that I can rotate passwords safely with MFA.
Acceptance Criteria
AC1: Steps are shown in order
AC2: User can pause and resume
AC3: MFA waiting state is explicit

Story RM-303: Auto rotation for supported sites
As a user, I want auto rotation where possible so that I save time.
Acceptance Criteria
AC1: Auto flow completes without user typing
AC2: Failures show a clear reason
AC3: Auto flow falls back to guided mode

Story RM-304: Verification proof
As a user, I want confirmation that the password changed so that I can trust the result.
Acceptance Criteria
AC1: Old password test fails
AC2: New password test succeeds
AC3: Verification results are stored

## Epic RM-E4 Extension and Agent

Story RM-401: Extension site match
As a user, I want the extension to detect the current site so that I can rotate from the page.
Acceptance Criteria
AC1: Site matches against vault domains
AC2: Extension shows matched or unmatched status
AC3: Clicking rotate sends a job to the app

Story RM-402: Agent connectivity
As a user, I want the agent to reconnect so that flows can continue after interruptions.
Acceptance Criteria
AC1: Agent disconnect is shown in the UI
AC2: Auto reconnect attempts occur
AC3: User can manually retry

## Epic RM-E5 Security and Settings

Story RM-501: Auto lock
As a user, I want the app to auto lock so that my data is protected.
Acceptance Criteria
AC1: Auto lock triggers after configured timeout
AC2: Unlock requires master key or biometrics
AC3: Clipboard is cleared on lock

Story RM-502: Sync toggle
As a user, I want to enable or disable sync so that I control data storage.
Acceptance Criteria
AC1: Sync can be turned off at any time
AC2: Local only mode works offline
AC3: Sync status is visible

Story RM-503: Allowed domains list
As a user, I want to control which domains can be automated so that I feel safe.
Acceptance Criteria
AC1: User can add or remove domains
AC2: Default list is empty for new users
AC3: Blocked domains show a clear reason

## Epic RM-E6 QA and Release

Story RM-601: Error taxonomy
As a user, I want clear error messages so that I know what to do next.
Acceptance Criteria
AC1: Errors map to a known code and description
AC2: UI suggests next steps for recoverable errors
AC3: Errors are logged locally

Story RM-602: Export vault
As a user, I want to export my vault so that I can keep a backup.
Acceptance Criteria
AC1: Export requires master key confirmation
AC2: Exported file is encrypted
AC3: Export shows a success confirmation

<!-- pagebreak -->
## 4. Jira Backlog

## Epics
| Epic ID | Name | Goal | Priority | Owner |
| --- | --- | --- | --- | --- |
| RM-E1 | Onboarding and Vault | Secure data foundation | High | PO |
| RM-E2 | Risk and Insights | Make risk visible | High | PO |
| RM-E3 | Rotation Queue and Flows | Enable bulk rotation | High | PO |
| RM-E4 | Extension and Agent | Execute flows safely | High | PO |
| RM-E5 | Security and Settings | Trust and control | Medium | PO |
| RM-E6 | QA and Release | Quality and readiness | High | QA Lead |

## Stories and Tasks
| ID | Type | Summary | Epic | Priority | SP | Sprint | Status | Dependencies |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RM-101 | Story | Import credentials from browser | RM-E1 | High | 5 | 1 | Planned | RM-001 |
| RM-102 | Story | Create master key and recovery | RM-E1 | High | 5 | 1 | Planned | RM-001 |
| RM-103 | Story | Search and filter vault | RM-E1 | Medium | 3 | 1 | Planned | RM-002 |
| RM-201 | Story | Risk center dashboard | RM-E2 | High | 5 | 2 | Planned | RM-101 |
| RM-202 | Story | Reuse detection | RM-E2 | High | 5 | 2 | Planned | RM-101 |
| RM-203 | Story | Insights charts | RM-E2 | Medium | 3 | 5 | Planned | RM-201 |
| RM-301 | Story | Rotation queue | RM-E3 | High | 5 | 3 | Planned | RM-201 |
| RM-302 | Story | Guided rotation flow | RM-E3 | High | 8 | 4 | Planned | RM-401 |
| RM-303 | Story | Auto rotation for top sites | RM-E3 | High | 8 | 5 | Planned | RM-302 |
| RM-304 | Story | Verification proof | RM-E3 | High | 5 | 5 | Planned | RM-302 |
| RM-401 | Story | Extension site match | RM-E4 | High | 5 | 4 | Planned | RM-003 |
| RM-402 | Story | Agent connectivity | RM-E4 | High | 5 | 3 | Planned | RM-003 |
| RM-501 | Story | Auto lock | RM-E5 | Medium | 3 | 6 | Planned | RM-102 |
| RM-502 | Story | Sync toggle | RM-E5 | Medium | 3 | 6 | Planned | RM-102 |
| RM-503 | Story | Allowed domains list | RM-E5 | Medium | 3 | 6 | Planned | RM-401 |
| RM-601 | Story | Error taxonomy | RM-E6 | High | 3 | 5 | Planned | RM-302 |
| RM-602 | Story | Export vault | RM-E6 | Medium | 3 | 6 | Planned | RM-101 |
| RM-001 | Task | App shell and routing | RM-E1 | High | 5 | 0 | Planned | None |
| RM-002 | Task | Encrypted SQLite setup | RM-E1 | High | 8 | 1 | Planned | RM-001 |
| RM-003 | Task | Local agent skeleton | RM-E4 | High | 5 | 3 | Planned | RM-001 |
| RM-004 | Task | Flow template schema | RM-E3 | High | 5 | 3 | Planned | RM-003 |
| RM-005 | Task | Extension messaging bridge | RM-E4 | High | 8 | 4 | Planned | RM-003 |

## Bugs
| ID | Type | Summary | Priority | Sprint | Status |
| --- | --- | --- | --- | --- | --- |
| RM-B01 | Bug | MFA wait state does not resume after code entry | High | 4 | Open |
| RM-B02 | Bug | Rotation queue shows duplicate entries after import | High | 2 | Open |
| RM-B03 | Bug | Auto lock does not clear clipboard | Medium | 6 | Open |
| RM-B04 | Bug | Extension fails to detect site on subdomain | Medium | 4 | Open |
| RM-B05 | Bug | Verification fails on slow network | Medium | 5 | Open |

<!-- pagebreak -->
## 5. Sprint Plan

Sprint Length: 2 weeks
Total Sprints: 6

## Sprint 0 Foundations
Goal: Build app shell and repo foundations
Backlog
1. RM-001 App shell and routing
2. Design tokens integration
3. Build pipeline and CI
Capacity: 18 SP

## Sprint 1 Vault Core and Import
Goal: Secure vault and import flow
Backlog
1. RM-102 Create master key and recovery
2. RM-002 Encrypted SQLite setup
3. RM-101 Import credentials from browser
4. RM-103 Search and filter vault
Capacity: 34 SP

## Sprint 2 Risk Engine and Dashboard
Goal: Risk visibility and dashboard
Backlog
1. RM-201 Risk center dashboard
2. RM-202 Reuse detection
Capacity: 28 SP

## Sprint 3 Rotation Queue and Agent
Goal: Queue model and agent skeleton
Backlog
1. RM-301 Rotation queue
2. RM-003 Local agent skeleton
3. RM-004 Flow template schema
Capacity: 30 SP

## Sprint 4 Extension and Guided Flow
Goal: Guided rotation with extension
Backlog
1. RM-401 Extension site match
2. RM-005 Extension messaging bridge
3. RM-302 Guided rotation flow
Capacity: 36 SP

## Sprint 5 Auto Flows and Verification
Goal: Automate top sites and verify
Backlog
1. RM-303 Auto rotation for top sites
2. RM-304 Verification proof
3. RM-601 Error taxonomy
Capacity: 38 SP

## Sprint 6 Hardening and Release
Goal: Stability and security controls
Backlog
1. RM-501 Auto lock
2. RM-502 Sync toggle
3. RM-503 Allowed domains list
4. RM-602 Export vault
Capacity: 24 SP

<!-- pagebreak -->
## 6. Test Strategy

Owner: Test Lead
Date: 2026-02-05

## Objectives
1. Validate core user flows for import, risk, rotation, and verification
2. Ensure security and privacy guarantees
3. Confirm performance and reliability of rotation flows

## Scope
In Scope
1. Desktop app UI and vault logic
2. Local agent and rotation flow runner
3. Browser extension behavior
4. Encryption, lock, and clipboard handling
5. Verification of password changes

Out of Scope
1. Third party site availability or uptime
2. Enterprise SSO integrations

## Test Levels
1. Unit testing for vault, risk, and flow runner
2. Integration testing for app to agent and agent to extension
3. End to end testing for guided rotation on test sites
4. Security testing for encryption and data handling
5. Performance testing for rotation queue and event handling

## Environments
1. Local dev environment
2. Staging environment with test sites
3. CI environment for unit and integration tests

## Data Strategy
1. Synthetic accounts for test sites
2. Masked test credentials for automation
3. Seeded vault with 1000 entries

## Tools
1. Unit: Jest or Vitest
2. E2E: Playwright
3. Security: SAST and dependency scanning
4. Performance: k6 for API, Playwright for UI timing

## Entry Criteria
1. Core features implemented for the sprint
2. Test environments ready
3. Test data prepared

## Exit Criteria
1. 95 percent test pass rate
2. No open critical defects
3. Performance targets met for core flows

## Test Scope by Feature
1. Import and merge flows
2. Risk scoring accuracy
3. Queue prioritization
4. Guided and auto flows
5. MFA handling and pause resume
6. Verification proof
7. Lock and clipboard clearing

<!-- pagebreak -->
## 7. Test Cases

| ID | Title | Preconditions | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| TC-001 | Create master key | App first launch | Enter master key, confirm, continue | Master key saved and vault created |
| TC-002 | Import from Chrome | Chrome installed | Choose Chrome import, confirm | Accounts imported with summary |
| TC-003 | CSV field mapping | CSV file available | Upload CSV, map fields, import | Correct fields mapped and imported |
| TC-004 | Reuse detection | Vault with repeated passwords | Run risk scan | Reused accounts flagged |
| TC-005 | Risk filtering | Vault with mixed risks | Filter by Breached | Only breached items shown |
| TC-006 | Rotation queue priority | Risk data available | Open queue | Breached and reused appear first |
| TC-007 | Guided rotation step order | Guided flow available | Start Rotator Mode | Steps appear in order |
| TC-008 | MFA pause and resume | MFA enabled test site | Trigger MFA step and complete | Flow pauses and resumes correctly |
| TC-009 | Auto flow success | Auto flow supported | Run auto flow | Password updated and verified |
| TC-010 | Verification old password fails | Rotation complete | Run verification | Old password rejected |
| TC-011 | Verification new password works | Rotation complete | Run verification | New password accepted |
| TC-012 | Agent reconnect | Agent stopped | Restart agent | UI shows connected state |
| TC-013 | Extension site match | Known domain open | Open extension popup | Site matched status shown |
| TC-014 | Auto lock clears clipboard | Copy password | Wait for lock timeout | Clipboard cleared and app locked |
| TC-015 | Export encrypted vault | Vault exists | Export and enter master key | Encrypted export file created |

<!-- pagebreak -->
## 8. Test Report

Report Date: 2026-02-05
Release: MVP Candidate

## Summary
Total Test Cases: 15
Passed: 13
Failed: 2
Blocked: 0
Pass Rate: 86.7 percent

## Key Findings
1. MFA resume fails on certain guided flows
2. Verification timing fails on slow network simulation

## Regression
1. Vault and import regression passed
2. Risk engine regression passed

## Performance Results
1. Vault search under 150ms with 1000 entries
2. Rotation queue renders under 500ms for 500 items

## Security Results
1. Encryption verified for vault storage
2. Clipboard cleared on lock
3. No plaintext secrets found in logs

## Open Defects
1. RM-B01 MFA wait state does not resume after code entry
2. RM-B05 Verification fails on slow network

<!-- pagebreak -->
## 9. Bug Report

| ID | Title | Severity | Priority | Status | Sprint | Steps | Expected | Actual | Resolution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RM-B01 | MFA resume fails after code entry | High | P1 | Open | 4 | Start guided flow, reach MFA, enter code | Flow resumes | Flow remains paused | Add event listener for OTP field submit and resume state |
| RM-B02 | Duplicate queue entries after import | High | P1 | Fixed | 2 | Import duplicated CSV, open queue | Single entry per account | Duplicates appear | Dedupe by account id and last updated timestamp |
| RM-B03 | Auto lock does not clear clipboard | Medium | P2 | Open | 6 | Copy password, wait for lock | Clipboard cleared | Clipboard retains value | Clear clipboard on lock trigger and on app blur |
| RM-B04 | Extension fails on subdomain match | Medium | P2 | Open | 4 | Open subdomain site, extension popup | Site matched | Unmatched status | Normalize domains using PSL and wildcard match |
| RM-B05 | Verification fails on slow network | Medium | P2 | Open | 5 | Rotate password with latency | Verification succeeds | Verification times out | Increase timeout and add retry with backoff |

<!-- pagebreak -->
## 10. Solution Architecture

Role: Solution Architect
Date: 2026-02-05

## Overview
Rotator Mode uses a desktop app for the vault and UI, a local agent for automation execution, and a browser extension for page level interaction. Secrets remain local and are encrypted at rest. The cloud component is optional and only stores metadata.

## Components
1. Desktop App
Responsibilities: vault UI, risk engine, rotation queue, settings
2. Local Agent
Responsibilities: flow execution, selector actions, state machine
3. Browser Extension
Responsibilities: site detection, step prompts, MFA handling
4. Optional Cloud Service
Responsibilities: metadata sync, flow templates, telemetry without secrets

## Data Flow
1. User unlocks vault and imports credentials
2. Risk engine computes scores and populates rotation queue
3. Rotation jobs sent to local agent
4. Agent drives browser extension for guided steps
5. Verification module confirms change
6. Results stored in local vault

## Security Controls
1. Master key derived using Argon2id
2. Vault encrypted using libsodium
3. No plaintext passwords stored in cloud
4. Clipboard auto clear and auto lock

## Observability
1. Local event logs for rotation flows
2. Error taxonomy to standardize failure modes
3. Optional telemetry without secrets

## Scalability
1. Queue supports large batches with backpressure
2. Flow templates are versioned
3. Extension runs minimal footprint per tab

<!-- pagebreak -->
## 11. Developer Guidelines

Role: Developer
Date: 2026-02-05

## Clean Coding Standards
1. Use single responsibility for modules and functions
2. Prefer pure functions in risk scoring and queue logic
3. Keep UI components small and composable
4. No secrets in logs, even in debug mode
5. Use consistent naming for flows, ids, and state machines

## Repository Structure
1. app for desktop UI
2. agent for local automation engine
3. extension for browser integration
4. shared for common utilities
5. tests for unit and integration suites

## Unit Testing Plan
1. Vault encryption and key derivation
2. Risk scoring and reuse detection
3. Queue prioritization and sorting
4. Flow runner step execution
5. Verification logic and retry policy

## Testing Standards
1. Minimum 80 percent unit coverage for core logic
2. Required tests for any flow template change
3. Regression tests for lock, clipboard, and sync

## Code Review Checklist
1. No secrets in logs
2. Error handling with recovery paths
3. Tests added for new logic
4. Performance impact reviewed
5. Security impact reviewed

<!-- pagebreak -->
## 12. Release Notes

Release: MVP Candidate
Date: 2026-02-05

## Highlights
1. Encrypted local vault with import
2. Risk scoring and queue prioritization
3. Guided rotation flows with MFA handling
4. Verification proof of password change

## New Features
1. Rotation queue with auto and guided modes
2. Extension site detection and prompts
3. Insights dashboard

## Security
1. Zero knowledge encryption and local first storage
2. Auto lock and clipboard clearing

## Known Issues
1. MFA resume bug in guided flows
2. Verification timing on slow networks

<!-- pagebreak -->
## 13. Design and Automation Artifacts

- Design Tokens: `design-tokens.json`
- Component Inventory: `components.json`
- Flow Schema: `flow-schema.json`
- Flow Templates: `flows/`
- Flow Lint Script: `scripts/validate_flows.py`

## Appendix A: Export Instructions

1. Export to PDF with header and footer enabled
2. Apply page numbering using the footer template
3. Respect page breaks marked as `<!-- pagebreak -->`
4. Ensure tables do not split across pages where possible