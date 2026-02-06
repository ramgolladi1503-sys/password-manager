# Flow Templates

This folder contains password rotation flow templates used by the local automation agent. Each flow describes how to navigate a site and change a password without storing secrets in the template.

## File Naming
Use a predictable filename:
`<site>.change-password.json`
Example: `acme-mail.change-password.json`

## Required Fields
1. `id` unique flow id, format `flow.<domain>.<action>`
2. `domain` base domain without scheme
3. `version` semver `MAJOR.MINOR.PATCH`
4. `modeSupport` list of `auto`, `guided`, `manual`
5. `requires` with `authenticatedSession`, `mfaSupported`, `captchaHandled`
6. `bindings` list of placeholders used in steps
7. `steps` ordered list of actions

## Placeholders
Use double braces for values that are injected locally:
- `{{old_password}}`
- `{{new_password}}`
- `{{username}}`

Never include real secrets in flow files.

## Actions
Allowed actions:
1. `navigate` with `target`
2. `click` with `selector`
3. `type` with `selector` and `value`
4. `select` with `selector` and `value`
5. `wait_for` with `selector` or `condition`
6. `pause_for_user` for MFA or captcha
7. `assert_text` and `assert_element`

## Signals
Signals are selectors or text markers that indicate captcha, rate limits, or MFA prompts.
Example:
```
"signals": {
  "mfaPrompt": ["input[name='otp']", "text=Enter code"]
}
```

## Verification
Use `verify` to confirm the old password fails and the new one succeeds.
Recommended whenever possible.

## Safety
Use safety limits to avoid lockouts:
- `maxAttempts`
- `cooldownSeconds`
- `lockoutGuard`

## Linting
Run the validator before committing:
```
python scripts/validate_flows.py
```
Optional flags:
```
python scripts/validate_flows.py --flows flows --schema flow-schema.json
```

## Conventions
1. Keep selectors stable and specific
2. Prefer `guided` steps for MFA
3. Do not rely on fragile text selectors
4. Keep step labels human readable and action oriented
5. Ensure each step id is unique

## Local Demo
Use the demo flow to validate extension execution end-to-end:
`flows/demo-site.change-password.json` (domain `localhost`, target `http://localhost:4173/`).
