# Test Strategy

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
