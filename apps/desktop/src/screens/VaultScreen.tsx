import { Card } from "../components/Card";
import { StatusPill } from "../components/StatusPill";
import { useVaultContext } from "../state/vaultContext";
import { getPrimaryRiskLabel, getPrimaryRiskTone } from "../data/vaultStore";

export const VaultScreen = () => {
  const { accounts, signalsById } = useVaultContext();

  return (
    <div className="screen-stack">
      <div className="toolbar-row">
        <div className="chip-row">
          <button className="chip">Breached</button>
          <button className="chip">Reused</button>
          <button className="chip">Weak</button>
          <button className="chip">Old</button>
        </div>
        <div className="toolbar-actions">
          <button className="btn secondary" type="button">Add Entry</button>
          <button className="btn ghost" type="button">Import</button>
        </div>
      </div>

      <Card>
        <table className="table">
          <thead>
            <tr>
              <th>Site</th>
              <th>Username</th>
              <th>Risk</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const signals = signalsById.get(account.id);
              const riskLabel = signals ? getPrimaryRiskLabel(signals) : "Safe";
              const tone = signals ? getPrimaryRiskTone(signals) : "neutral";
              return (
                <tr key={account.id}>
                  <td>{account.domain}</td>
                  <td>{account.username}</td>
                  <td><StatusPill label={riskLabel} tone={tone} /></td>
                  <td>{signals?.ageDays ?? 0}d</td>
                  <td>
                    <button className="btn ghost" type="button">Rotate</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
