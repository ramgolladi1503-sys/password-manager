import { Card } from "../components/Card";
import { useVaultContext } from "../state/vaultContext";

export const InsightsScreen = () => {
  const { riskSummary } = useVaultContext();

  return (
    <div className="screen-stack">
      <div className="grid three-column">
        <Card title="Risk Reduction" subtitle="Last 30 days">
          <div className="chart">Breached: {riskSummary.breached}</div>
        </Card>
        <Card title="Rotation Success" subtitle="Top flows">
          <div className="chart">Success rate 82%</div>
        </Card>
        <Card title="Weekly Rotations" subtitle="Volume">
          <div className="chart">12 rotations</div>
        </Card>
      </div>
      <Card title="Top Risk Behaviors" subtitle="Actionable insights">
        <ul className="list">
          <li>{riskSummary.reused} accounts still using reused passwords</li>
          <li>{riskSummary.breached} breached entries pending rotation</li>
          <li>{riskSummary.old} accounts older than 180 days</li>
        </ul>
      </Card>
    </div>
  );
};
