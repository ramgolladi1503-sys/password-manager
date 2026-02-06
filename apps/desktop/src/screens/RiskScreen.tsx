import { Card } from "../components/Card";
import { StatusPill } from "../components/StatusPill";
import { useVaultContext } from "../state/vaultContext";
import { getPrimaryRiskLabel, getPrimaryRiskTone } from "../data/vaultStore";

const heatmap = Array.from({ length: 24 }, (_, index) => index);

export const RiskScreen = () => {
  const { accounts, riskSummary, signalsById } = useVaultContext();

  return (
    <div className="screen-stack">
      <div className="grid two-column">
        <Card title="Risk Heatmap" subtitle="Last 30 days">
          <div className="heatmap">
            {heatmap.map((cell) => (
              <div className={`heatmap-cell level-${(cell % 5) + 1}`} key={cell} />
            ))}
          </div>
        </Card>
        <Card title="Top Risk Drivers" subtitle="Where attention is needed">
          <ul className="list">
            <li>Reused passwords across {riskSummary.reused} domains</li>
            <li>Old credentials older than 180 days</li>
            <li>Breached entries from public leak</li>
            <li>Weak passwords below 12 characters</li>
          </ul>
        </Card>
      </div>

      <Card title="Risk Breakdown" subtitle="Account list">
        <div className="risk-list">
          {accounts.map((account) => {
            const signals = signalsById.get(account.id);
            const label = signals ? getPrimaryRiskLabel(signals) : "Safe";
            const tone = signals ? getPrimaryRiskTone(signals) : "neutral";
            return (
              <div className="risk-row" key={account.id}>
                <div>
                  <p className="strong">{account.domain}</p>
                  <p className="muted">{label}</p>
                </div>
                <StatusPill label={label} tone={tone} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
