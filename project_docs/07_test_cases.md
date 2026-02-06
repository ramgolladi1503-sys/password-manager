# Test Cases

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
