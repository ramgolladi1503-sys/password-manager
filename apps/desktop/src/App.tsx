import { useState } from "react";
import { HomeScreen } from "./screens/HomeScreen";
import { VaultScreen } from "./screens/VaultScreen";
import { RiskScreen } from "./screens/RiskScreen";
import { QueueScreen } from "./screens/QueueScreen";
import { RotatorModeScreen } from "./screens/RotatorModeScreen";
import { VerificationScreen } from "./screens/VerificationScreen";
import { InsightsScreen } from "./screens/InsightsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { FlowAuthorScreen } from "./screens/FlowAuthorScreen";
import { VaultLockScreen } from "./screens/VaultLockScreen";
import { StatusPill } from "./components/StatusPill";
import { useAgent } from "./state/agentContext";
import { useVaultContext } from "./state/vaultContext";

const screens = {
  home: {
    label: "Home",
    title: "Rotation Dashboard",
    action: "Start Rotator Mode",
    component: HomeScreen,
    showSearch: false
  },
  vault: {
    label: "Vault",
    title: "Vault",
    action: "New Entry",
    component: VaultScreen,
    showSearch: true
  },
  risk: {
    label: "Risk",
    title: "Risk Center",
    action: "Review Breaches",
    component: RiskScreen,
    showSearch: true
  },
  queue: {
    label: "Queue",
    title: "Rotation Queue",
    action: "Rotate All",
    component: QueueScreen,
    showSearch: false
  },
  rotator: {
    label: "Rotator",
    title: "Rotator Mode",
    action: "Pause",
    component: RotatorModeScreen,
    showSearch: false
  },
  verify: {
    label: "Verification",
    title: "Verification",
    action: "Continue",
    component: VerificationScreen,
    showSearch: false
  },
  insights: {
    label: "Insights",
    title: "Insights",
    action: "Export",
    component: InsightsScreen,
    showSearch: false
  },
  settings: {
    label: "Settings",
    title: "Settings",
    action: "Save",
    component: SettingsScreen,
    showSearch: false
  },
  author: {
    label: "Author",
    title: "Flow Authoring",
    action: "Save Flow",
    component: FlowAuthorScreen,
    showSearch: false
  }
} as const;

type ScreenKey = keyof typeof screens;

export const App = () => {
  const [active, setActive] = useState<ScreenKey>("home");
  const Screen = screens[active].component;
  const { connected } = useAgent();
  const vault = useVaultContext();

  if (vault.locked) {
    return (
      <VaultLockScreen
        needsSetup={vault.needsSetup}
        loading={vault.loading}
        error={vault.error}
        onUnlock={vault.unlock}
        onSetup={vault.setup}
        onWipe={vault.wipeVault}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="brand-block">
          <div className="brand">Password Cluster</div>
          <StatusPill
            label={connected ? "Agent Connected" : "Agent Offline"}
            tone={connected ? "good" : "warn"}
          />
        </div>
        <nav className="nav-items">
          {Object.entries(screens).map(([key, screen]) => (
            <button
              key={key}
              className={`nav-item ${active === key ? "active" : ""}`}
              onClick={() => setActive(key as ScreenKey)}
              type="button"
            >
              {screen.label}
            </button>
          ))}
        </nav>
        <div className="side-footer">
          <p className="muted">v0.1 prototype</p>
        </div>
      </aside>

      <main className="content">
        <header className="top-bar">
          <div>
            <div className="title">{screens[active].title}</div>
            <p className="muted">Operational overview for your rotation workspace</p>
          </div>
          <div className="top-actions">
            {screens[active].showSearch ? (
              <input className="search" placeholder="Search" />
            ) : null}
            <button className="btn ghost" type="button" onClick={vault.lock}>
              Lock Vault
            </button>
            <button className="btn primary" type="button">{screens[active].action}</button>
          </div>
        </header>
        <section className="screen">
          <Screen />
        </section>
      </main>
    </div>
  );
};
