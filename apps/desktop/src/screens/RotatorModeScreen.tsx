import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { StatusPill } from "../components/StatusPill";
import { useAgent } from "../state/agentContext";
import { useVaultContext } from "../state/vaultContext";
import { generatePassword } from "../data/vaultStore";

const statusTone = (status: string | undefined) => {
  if (status === "completed") return "good";
  if (status === "failed") return "risk";
  if (status === "paused") return "warn";
  if (status === "started" || status === "step-start") return "info";
  return "neutral";
};

export const RotatorModeScreen = () => {
  const {
    connected,
    flows,
    flowDetail,
    rotationEvents,
    requestFlowDetail,
    startRotation
  } = useAgent();
  const { accounts, setPassword } = useVaultContext();

  const [selectedFlowId, setSelectedFlowId] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [domain, setDomain] = useState("");
  const [newPassword, setNewPassword] = useState(generatePassword());
  const [driver, setDriver] = useState<"playwright" | "extension">("extension");

  useEffect(() => {
    if (!selectedFlowId && flows.length > 0) {
      setSelectedFlowId(flows[0].id);
    }
  }, [flows, selectedFlowId]);

  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accountId, accounts]);

  useEffect(() => {
    if (selectedFlowId) {
      requestFlowDetail(selectedFlowId);
    }
  }, [selectedFlowId, requestFlowDetail]);

  useEffect(() => {
    if (flowDetail?.domain) {
      setDomain(flowDetail.domain);
    }
  }, [flowDetail]);

  useEffect(() => {
    const account = accounts.find((item) => item.id === accountId);
    if (account) {
      setDomain(account.domain);
    }
  }, [accountId, accounts]);

  const lastEvent = rotationEvents[rotationEvents.length - 1];
  const overallStatus = connected ? lastEvent?.status ?? "idle" : "disconnected";

  useEffect(() => {
    if (lastEvent?.status === "completed" && accountId) {
      setPassword(accountId, newPassword);
      setNewPassword(generatePassword());
    }
  }, [lastEvent?.status, accountId, newPassword, setPassword]);

  const stepStatus = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of rotationEvents) {
      if (event.stepId) {
        if (event.status === "step-start") {
          map.set(event.stepId, "active");
        }
        if (event.status === "step-complete") {
          map.set(event.stepId, "complete");
        }
        if (event.status === "paused") {
          map.set(event.stepId, "paused");
        }
        if (event.status === "failed") {
          map.set(event.stepId, "failed");
        }
      }
    }
    return map;
  }, [rotationEvents]);

  const handleStart = () => {
    if (!selectedFlowId) {
      return;
    }
    const account = accounts.find((item) => item.id === accountId);
    if (!account) {
      return;
    }
    startRotation({
      flowId: selectedFlowId,
      accountId: account.id,
      domain: account.domain,
      bindings: {
        username: account.username,
        old_password: account.password,
        new_password: newPassword
      },
      driver
    });
  };

  return (
    <div className="rotator-layout">
      <Card className="rotator-panel" title="Flow Runner" subtitle="Live orchestration">
        <div className="stack">
          <div className="form-field">
            <label>Flow</label>
            <select
              value={selectedFlowId}
              onChange={(event) => setSelectedFlowId(event.target.value)}
            >
              {flows.map((flow) => (
                <option key={flow.id} value={flow.id}>
                  {flow.domain} ({flow.modeSupport.join(", ")})
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Account</label>
            <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.domain} • {account.username}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Domain</label>
            <input value={domain} onChange={(event) => setDomain(event.target.value)} />
          </div>
          <div className="form-field">
            <label>New Password</label>
            <div className="inline-row">
              <input type="password" value={newPassword} readOnly />
              <button
                className="btn ghost"
                type="button"
                onClick={() => setNewPassword(generatePassword())}
              >
                Regenerate
              </button>
            </div>
          </div>
          <div className="form-field">
            <label>Execution Target</label>
            <select
              value={driver}
              onChange={(event) => setDriver(event.target.value as "playwright" | "extension")}
            >
              <option value="extension">Active Browser Tab (Extension)</option>
              <option value="playwright">Agent Playwright</option>
            </select>
          </div>

          <div className="flow-status">
            <StatusPill label={overallStatus} tone={statusTone(overallStatus)} />
            <span className="muted">{connected ? "Agent connected" : "Agent offline"}</span>
          </div>

          <div className="action-row">
            <button className="btn primary" type="button" onClick={handleStart}>
              Start Flow
            </button>
            <button className="btn ghost" type="button">
              Pause
            </button>
          </div>
        </div>
      </Card>

      <Card className="rotator-viewport" title="Steps" subtitle="Execution timeline">
        <div className="flow-steps">
          {flowDetail?.steps?.map((step) => {
            const state = stepStatus.get(step.id) ?? "pending";
            return (
              <div key={step.id} className={`flow-step ${state}`}>
                <div>
                  <p className="strong">{step.label}</p>
                  <p className="muted">{step.action}</p>
                </div>
                <StatusPill label={state} tone={statusTone(state)} />
              </div>
            );
          })}
        </div>

        {flowDetail?.verify?.length ? (
          <div className="verify-steps">
            <p className="strong">Verification</p>
            <div className="flow-steps">
              {flowDetail.verify.map((step) => {
                const state = stepStatus.get(step.id) ?? "pending";
                return (
                  <div key={step.id} className={`flow-step ${state}`}>
                    <div>
                      <p className="strong">{step.label}</p>
                      <p className="muted">{step.action}</p>
                    </div>
                    <StatusPill label={state} tone={statusTone(state)} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="event-log">
          <p className="strong">Event log</p>
          <div className="log-list">
            {rotationEvents.slice().reverse().map((event, index) => (
              <div key={`${event.requestId}-${index}`} className="log-row">
                <span className="muted">{event.status}</span>
                <span>{event.message ?? ""}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
