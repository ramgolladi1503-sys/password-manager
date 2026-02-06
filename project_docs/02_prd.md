# Product Requirements Document

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
