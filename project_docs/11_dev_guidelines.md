# Developer Guidelines

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
