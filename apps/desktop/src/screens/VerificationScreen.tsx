import { Card } from "../components/Card";
import { StatusPill } from "../components/StatusPill";

export const VerificationScreen = () => (
  <div className="screen-stack">
    <Card title="Verification" subtitle="Proof of change">
      <div className="verification">
        <StatusPill label="Verified" tone="good" />
        <p className="strong">Old password rejected</p>
        <p className="muted">New password accepted and stored securely.</p>
        <div className="action-row">
          <button className="btn primary" type="button">Continue</button>
          <button className="btn ghost" type="button">Retest Login</button>
        </div>
      </div>
    </Card>
  </div>
);
