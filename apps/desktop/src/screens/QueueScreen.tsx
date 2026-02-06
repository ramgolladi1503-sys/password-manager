import { Card } from "../components/Card";
import { StatusPill } from "../components/StatusPill";
import { useVaultContext } from "../state/vaultContext";

export const QueueScreen = () => {
  const { queue } = useVaultContext();

  return (
    <div className="screen-stack">
      <Card title="Rotation Queue" subtitle="Prioritized by risk">
        <div className="queue-list">
          {queue.map((item) => (
            <div className="queue-row" key={item.accountId}>
              <div>
                <p className="strong">{item.domain}</p>
                <p className="muted">{item.mode} mode • priority {item.priority}</p>
              </div>
              <StatusPill label="Ready" tone="good" />
            </div>
          ))}
        </div>
        <div className="action-row">
          <button className="btn primary" type="button">Rotate All</button>
          <button className="btn ghost" type="button">Pause Queue</button>
        </div>
      </Card>
    </div>
  );
};
