# Jira Backlog

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
