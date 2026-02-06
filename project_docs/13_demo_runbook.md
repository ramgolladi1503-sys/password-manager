# End-to-End Demo Runbook

This runbook walks a first-time user through the full live demo: agent + extension + desktop + demo site.

## Prerequisites
1. Node 20+ installed
2. Chrome (or Chromium) installed
3. Repo dependencies installed with `npm run install:all`
4. Playwright browser install is CI-only by default. Locally, you can skip unless running UI tests.

Local UI test fallback:
```
npx playwright install chromium
```

## Quick Start (First Time)
1. Start the demo site:
```
python -m http.server 4173 --directory apps/demo-site
```
2. Start the agent:
```
npm run dev:agent
```
3. Build the extension:
```
npm --prefix apps/extension run build
```
4. Load the extension:
```
Chrome -> Extensions -> Enable Developer mode -> Load unpacked -> apps/extension/dist
```
5. Start the desktop app:
```
npm run dev:desktop
```
6. Open the demo site:
```
http://localhost:4173/
```
7. Open the desktop app in a browser tab:
```
http://localhost:5173/
```

## Run the Demo Flow
1. Unlock the vault with a master password.
2. Go to the **Rotator** screen.
3. Select flow: `flow.demo-site.change-password` (domain `localhost`).
4. Select account: `demo@password.cluster`.
5. Set driver: **Active Browser Tab (Extension)**.
6. Keep the demo site tab active and click **Start Flow**.
7. Watch the overlay auto-fill, click, and confirm the rotation.

## Scripted Demo (Automation)
Run the full demo script locally:
```
npm run demo:e2e
```
Modes:
- Extension mode (default): loads the browser extension and runs on the active tab.
- Playwright mode (CI-friendly): `E2E_MODE=playwright npm run demo:e2e`
Note: Extension mode requires a headed Chromium session with extensions enabled.

## Expected Result
1. The overlay shows steps completing with progress.
2. A “Password updated” toast appears on the demo site.
3. The Rotator event log shows a completed status.

## Troubleshooting
1. Agent not connected:
Check `ws://localhost:8787` is reachable and `npm run dev:agent` is running.
2. Extension not responding:
Reload the unpacked extension and confirm the active tab matches `http://localhost:4173/`.
3. Flow selector errors:
Run `npm run test:flows` and verify flow selectors in `flows/demo-site.change-password.json`.
4. Desktop app not loading:
Ensure `npm run dev:desktop` is running and open `http://localhost:5173/`.
5. Auto-fill not working:
Confirm the flow driver is set to **Active Browser Tab (Extension)**.
