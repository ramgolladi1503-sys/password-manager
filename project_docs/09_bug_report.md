# Bug Report

| ID | Title | Severity | Priority | Status | Sprint | Steps | Expected | Actual | Resolution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RM-B01 | MFA resume fails after code entry | High | P1 | Open | 4 | Start guided flow, reach MFA, enter code | Flow resumes | Flow remains paused | Add event listener for OTP field submit and resume state |
| RM-B02 | Duplicate queue entries after import | High | P1 | Fixed | 2 | Import duplicated CSV, open queue | Single entry per account | Duplicates appear | Dedupe by account id and last updated timestamp |
| RM-B03 | Auto lock does not clear clipboard | Medium | P2 | Open | 6 | Copy password, wait for lock | Clipboard cleared | Clipboard retains value | Clear clipboard on lock trigger and on app blur |
| RM-B04 | Extension fails on subdomain match | Medium | P2 | Open | 4 | Open subdomain site, extension popup | Site matched | Unmatched status | Normalize domains using PSL and wildcard match |
| RM-B05 | Verification fails on slow network | Medium | P2 | Open | 5 | Rotate password with latency | Verification succeeds | Verification times out | Increase timeout and add retry with backoff |
