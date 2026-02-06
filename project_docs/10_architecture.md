# Solution Architecture

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
