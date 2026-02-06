import { Card } from "../components/Card";
import { useVaultContext } from "../state/vaultContext";

const options = [
  { label: "Off", value: 0 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 }
];

export const SettingsScreen = () => {
  const { autoLockMinutes, setAutoLockMinutes } = useVaultContext();

  return (
    <div className="screen-stack">
      <div className="grid two-column">
        <Card title="Security" subtitle="Protection and access">
          <div className="settings-row">
            <div>
              <p className="strong">Auto lock</p>
              <p className="muted">
                {autoLockMinutes > 0
                  ? `Lock after ${autoLockMinutes} minutes of inactivity`
                  : "Auto lock disabled"}
              </p>
            </div>
            <select
              value={autoLockMinutes}
              onChange={(event) => setAutoLockMinutes(Number(event.target.value))}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="settings-row">
            <div>
              <p className="strong">Hardware key</p>
              <p className="muted">Use a security key for unlock</p>
            </div>
            <button className="btn secondary" type="button">Enable</button>
          </div>
        </Card>
        <Card title="Automation" subtitle="Control flow access">
          <div className="settings-row">
            <div>
              <p className="strong">Allowed domains</p>
              <p className="muted">3 domains whitelisted</p>
            </div>
            <button className="btn ghost" type="button">Manage</button>
          </div>
          <div className="settings-row">
            <div>
              <p className="strong">MFA handling</p>
              <p className="muted">Require confirmation for MFA steps</p>
            </div>
            <button className="btn ghost" type="button">Review</button>
          </div>
        </Card>
      </div>

      <Card title="Sync" subtitle="Device and backup">
        <div className="settings-row">
          <div>
            <p className="strong">Sync status</p>
            <p className="muted">Local only mode enabled</p>
          </div>
          <button className="btn secondary" type="button">Enable Sync</button>
        </div>
      </Card>
    </div>
  );
};
