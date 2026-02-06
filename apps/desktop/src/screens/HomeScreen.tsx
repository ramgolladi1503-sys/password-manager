import { Card } from "../components/Card";
import { StatusPill } from "../components/StatusPill";
import { SectionHeader } from "../components/SectionHeader";
import { useVaultContext } from "../state/vaultContext";

const recentChanges = [
  { site: "acme-mail.example", time: "2m ago", result: "Rotated" },
  { site: "shophub.example", time: "1h ago", result: "Verified" },
  { site: "newsroom.example", time: "Yesterday", result: "Queued" }
];

export const HomeScreen = () => {
  const { queue, riskSummary } = useVaultContext();
  const queuePreview = queue.slice(0, 3);
  const riskScore = 100 - queue.reduce((acc, item) => acc + item.signals.score, 0) / 10;
  const score = Math.max(0, Math.min(100, Math.round(riskScore)));

  return (
    <div className="screen-stack">
      <div className="grid two-column">
        <Card title="Risk Score" subtitle="Overall security posture">
          <div className="gauge">
            <div className="gauge-value">{score}</div>
            <div className="gauge-label">Stable</div>
          </div>
          <div className="summary-grid">
            <div className="summary-card">
              <p className="muted">Breached</p>
              <h3>{riskSummary.breached}</h3>
            </div>
            <div className="summary-card">
              <p className="muted">Reused</p>
              <h3>{riskSummary.reused}</h3>
            </div>
            <div className="summary-card">
              <p className="muted">Weak</p>
              <h3>{riskSummary.weak}</h3>
            </div>
            <div className="summary-card">
              <p className="muted">Old</p>
              <h3>{riskSummary.old}</h3>
            </div>
          </div>
        </Card>

        <Card title="Rotation Queue" subtitle="Top priority accounts">
          <div className="queue-list">
            {queuePreview.map((item) => (
              <div className="queue-row" key={item.accountId}>
                <div>
                  <p className="strong">{item.domain}</p>
                  <p className="muted">{item.mode} mode</p>
                </div>
                <StatusPill label="Ready" tone="good" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent Changes" subtitle="Rotation activity">
        <div className="timeline">
          {recentChanges.map((item) => (
            <div className="timeline-row" key={item.site}>
              <div>
                <p className="strong">{item.site}</p>
                <p className="muted">{item.result}</p>
              </div>
              <span className="muted">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Quick Actions" subtitle="Accelerate your cleanup">
        <div className="action-row">
          <button className="btn primary" type="button">Rotate Top 10</button>
          <button className="btn secondary" type="button">Review Breached</button>
          <button className="btn ghost" type="button">Export Report</button>
        </div>
      </Card>

      <SectionHeader title="System Status" />
      <div className="status-grid">
        <Card>
          <h3>Agent</h3>
          <StatusPill label="Connected" tone="good" />
          <p className="muted">Last heartbeat 20s ago</p>
        </Card>
        <Card>
          <h3>Extension</h3>
          <StatusPill label="Active" tone="info" />
          <p className="muted">3 tabs monitored</p>
        </Card>
        <Card>
          <h3>Flows</h3>
          <StatusPill label="10 ready" tone="neutral" />
          <p className="muted">2 need review</p>
        </Card>
      </div>
    </div>
  );
};
