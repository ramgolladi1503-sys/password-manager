# Business Analyst User Stories

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
