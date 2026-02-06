import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { useAgent } from "../state/agentContext";
import type { FlowDetail, FlowStep } from "@password-cluster/protocol";

const emptyFlow: FlowDetail = {
  id: "flow.new.change-password",
  domain: "",
  version: "1.0.0",
  bindings: ["old_password", "new_password"],
  modeSupport: ["guided"],
  steps: []
};

const actions = [
  "navigate",
  "click",
  "type",
  "select",
  "wait_for",
  "pause_for_user",
  "assert_text",
  "assert_element"
];

const modes = ["auto", "guided", "manual"] as const;

type StepError = Record<string, string>;

const stepTemplates = [
  {
    label: "Navigate to URL",
    step: { action: "navigate", mode: "auto" as const, label: "Open page", target: "https://" }
  },
  {
    label: "Click button/link",
    step: { action: "click", mode: "auto" as const, label: "Click control", selector: "" }
  },
  {
    label: "Type into field",
    step: { action: "type", mode: "auto" as const, label: "Enter value", selector: "", value: "" }
  },
  {
    label: "Wait for selector",
    step: { action: "wait_for", mode: "auto" as const, label: "Wait for element", selector: "" }
  },
  {
    label: "Pause for user (MFA)",
    step: { action: "pause_for_user", mode: "guided" as const, label: "Complete MFA" }
  },
  {
    label: "Assert text",
    step: { action: "assert_text", mode: "auto" as const, label: "Confirm text", selector: "", value: "" }
  }
];

const selectorHints: Record<string, string[]> = {
  click: ["#id", "button.primary", "[data-testid='save']"],
  type: ["#field-id", "input[name='password']", "[data-testid='password']"],
  select: ["select[name='options']", "[data-testid='select']"],
  assert_text: ["#toast", ".alert-success", "[data-testid='message']"],
  assert_element: ["#settings-panel", ".modal", "[data-testid='panel']"],
  wait_for: ["#loader", ".toast", "[data-testid='ready']"]
};

const quickActions = [
  { label: "Navigate", action: "navigate", mode: "auto" as const, target: "https://" },
  { label: "Click", action: "click", mode: "auto" as const, selector: "" },
  { label: "Type", action: "type", mode: "auto" as const, selector: "", value: "" },
  { label: "Wait", action: "wait_for", mode: "auto" as const, selector: "" },
  { label: "Pause", action: "pause_for_user", mode: "guided" as const },
  { label: "Assert", action: "assert_text", mode: "auto" as const, selector: "", value: "" }
];

const lintSelector = (selector: string) => {
  if (!selector) return [];
  const warnings: string[] = [];
  if (selector.startsWith("text=")) warnings.push("Text selectors are fragile");
  if (selector.includes(":nth-")) warnings.push("nth-child selectors are brittle");
  if (selector.includes(" ")) warnings.push("Deep selectors may break with layout changes");
  if (/^\.[a-z0-9_-]+$/i.test(selector)) warnings.push("Single class selectors can be unstable");
  if (/^(div|span|section|button|input|select|a)$/i.test(selector)) {
    warnings.push("Generic tag selectors are too broad");
  }
  if (/\[data-testid=['"]/.test(selector)) {
    return [];
  }
  return warnings;
};

const validateStep = (step: FlowStep): StepError => {
  const errors: StepError = {};
  if (!step.label) errors.label = "Label is required";
  if (!step.action) errors.action = "Action is required";
  if (["click", "type", "select", "assert_text", "assert_element"].includes(step.action) && !step.selector) {
    errors.selector = "Selector required for this action";
  }
  if (["type", "select", "assert_text"].includes(step.action) && !step.value) {
    errors.value = "Value required for this action";
  }
  if (step.action === "navigate" && !step.target) {
    errors.target = "Target URL required";
  }
  if (step.action === "wait_for" && !step.selector && !step.condition) {
    errors.condition = "Selector or condition required";
  }
  return errors;
};

export const FlowAuthorScreen = () => {
  const {
    flows,
    flowDetail,
    requestFlowDetail,
    saveFlow,
    flowSaveStatus,
    testSelector,
    selectorTests,
    captureSelector,
    selectorCaptures
  } = useAgent();

  const [selectedFlowId, setSelectedFlowId] = useState("");
  const [draft, setDraft] = useState<FlowDetail>(emptyFlow);
  const [error, setError] = useState("");
  const [pendingCapture, setPendingCapture] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!selectedFlowId && flows.length > 0) {
      setSelectedFlowId(flows[0].id);
    }
  }, [flows, selectedFlowId]);

  useEffect(() => {
    if (selectedFlowId) {
      requestFlowDetail(selectedFlowId);
    }
  }, [selectedFlowId, requestFlowDetail]);

  useEffect(() => {
    if (flowDetail) {
      setDraft(flowDetail);
      setError("");
    }
  }, [flowDetail]);

  useEffect(() => {
    Object.entries(pendingCapture).forEach(([requestId, index]) => {
      if (selectorCaptures[requestId] !== undefined) {
        const selector = selectorCaptures[requestId];
        if (selector) {
          updateStep(index, { selector });
        }
        setPendingCapture((prev) => {
          const next = { ...prev };
          delete next[requestId];
          return next;
        });
      }
    });
  }, [pendingCapture, selectorCaptures]);

  const stepErrors = useMemo(() => draft.steps.map(validateStep), [draft.steps]);

  const updateFlow = (patch: Partial<FlowDetail>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const updateStep = (index: number, patch: Partial<FlowStep>) => {
    setDraft((prev) => {
      const steps = [...prev.steps];
      steps[index] = { ...steps[index], ...patch };
      return { ...prev, steps };
    });
  };

  const addStep = () => {
    setDraft((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: `step-${prev.steps.length + 1}`,
          label: "New step",
          mode: "guided",
          action: "click"
        }
      ]
    }));
  };

  const addTemplate = (templateIndex: number) => {
    const template = stepTemplates[templateIndex];
    if (!template) return;
    setDraft((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: `step-${prev.steps.length + 1}`,
          label: template.step.label,
          mode: template.step.mode,
          action: template.step.action,
          selector: template.step.selector,
          target: template.step.target,
          value: template.step.value,
          condition: template.step.condition
        }
      ]
    }));
  };

  const addQuickAction = (actionIndex: number) => {
    const template = quickActions[actionIndex];
    if (!template) return;
    setDraft((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: `step-${prev.steps.length + 1}`,
          label: `New ${template.label} step`,
          mode: template.mode,
          action: template.action,
          selector: template.selector,
          target: template.target,
          value: template.value
        }
      ]
    }));
  };

  const removeStep = (index: number) => {
    setDraft((prev) => {
      const steps = prev.steps.filter((_, idx) => idx != index);
      return { ...prev, steps };
    });
  };

  const moveStep = (index: number, direction: number) => {
    setDraft((prev) => {
      const steps = [...prev.steps];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= steps.length) return prev;
      const [item] = steps.splice(index, 1);
      steps.splice(newIndex, 0, item);
      return { ...prev, steps };
    });
  };

  const handleSave = () => {
    if (!draft.id || !draft.domain) {
      setError("Flow id and domain are required.");
      return;
    }
    setError("");
    saveFlow(draft);
  };

  return (
    <div className="screen-stack">
      <Card title="Flow Authoring" subtitle="Visual flow builder">
        <div className="form-field">
          <label>Existing Flows</label>
          <select value={selectedFlowId} onChange={(event) => setSelectedFlowId(event.target.value)}>
            {flows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.domain} ({flow.modeSupport.join(", ")})
              </option>
            ))}
          </select>
        </div>

        <div className="grid two-column">
          <div className="form-field">
            <label>Flow Id</label>
            <input value={draft.id} onChange={(event) => updateFlow({ id: event.target.value })} />
          </div>
          <div className="form-field">
            <label>Domain</label>
            <input value={draft.domain} onChange={(event) => updateFlow({ domain: event.target.value })} />
          </div>
          <div className="form-field">
            <label>Version</label>
            <input value={draft.version} onChange={(event) => updateFlow({ version: event.target.value })} />
          </div>
          <div className="form-field">
            <label>Bindings (comma separated)</label>
            <input
              value={draft.bindings.join(", ")}
              onChange={(event) =>
                updateFlow({
                  bindings: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                })
              }
            />
          </div>
        </div>

        <div className="form-field">
          <label>Supported Modes</label>
          <div className="chip-row">
            {modes.map((mode) => (
              <label key={mode} className="chip chip-toggle">
                <input
                  type="checkbox"
                  checked={draft.modeSupport.includes(mode)}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    updateFlow({
                      modeSupport: checked
                        ? [...draft.modeSupport, mode]
                        : draft.modeSupport.filter((item) => item !== mode)
                    });
                  }}
                />
                <span>{mode}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="action-row">
          <div className="inline-row">
            <button className="btn secondary" type="button" onClick={addStep}>
              Add Step
            </button>
            <select
              className="compact-select"
              onChange={(event) => {
                const index = Number(event.target.value);
                if (!Number.isNaN(index)) {
                  addTemplate(index);
                }
                event.currentTarget.selectedIndex = 0;
              }}
            >
              <option value="">Add template...</option>
              {stepTemplates.map((template, index) => (
                <option key={template.label} value={index}>
                  {template.label}
                </option>
              ))}
            </select>
            <span className="muted">Use Capture to grab selectors from the active tab.</span>
          </div>
        </div>

        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={action.label}
              className="btn ghost"
              type="button"
              onClick={() => addQuickAction(index)}
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="flow-step-editor">
          {draft.steps.map((step, index) => {
            const errors = stepErrors[index] ?? {};
            const selectorResult = selectorTests[step.selector ?? ""];
            const selectorWarnings = lintSelector(step.selector ?? "");
            const capturePending = Object.values(pendingCapture).includes(index);
            return (
              <div key={step.id} className="flow-step-card">
                <div className="flow-step-header">
                  <h3>Step {index + 1}</h3>
                  <div className="inline-row">
                    <button className="btn ghost" type="button" onClick={() => moveStep(index, -1)}>
                      Up
                    </button>
                    <button className="btn ghost" type="button" onClick={() => moveStep(index, 1)}>
                      Down
                    </button>
                    <button className="btn ghost" type="button" onClick={() => removeStep(index)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid two-column">
                  <div className="form-field">
                    <label>Label</label>
                    <input
                      value={step.label}
                      onChange={(event) => updateStep(index, { label: event.target.value })}
                    />
                    {errors.label ? <span className="error-text">{errors.label}</span> : null}
                  </div>
                  <div className="form-field">
                    <label>Action</label>
                    <select
                      value={step.action}
                      onChange={(event) => updateStep(index, { action: event.target.value })}
                    >
                      {actions.map((action) => (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      ))}
                    </select>
                    {errors.action ? <span className="error-text">{errors.action}</span> : null}
                  </div>
                  <div className="form-field">
                    <label>Mode</label>
                    <select
                      value={step.mode}
                      onChange={(event) => updateStep(index, { mode: event.target.value as FlowStep["mode"] })}
                    >
                      {modes.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Selector</label>
                    <div className="inline-row">
                      <input
                        value={step.selector ?? ""}
                        onChange={(event) => updateStep(index, { selector: event.target.value })}
                      />
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => step.selector && testSelector(step.selector)}
                      >
                        Test
                      </button>
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => {
                          const requestId = captureSelector();
                          setPendingCapture((prev) => ({ ...prev, [requestId]: index }));
                        }}
                      >
                        Capture
                      </button>
                    </div>
                    {selectorResult !== undefined ? (
                      <span className={selectorResult ? "success-text" : "error-text"}>
                        {selectorResult ? "Selector found" : "Selector not found"}
                      </span>
                    ) : null}
                    {capturePending ? <span className="warn-text">Capturing selector...</span> : null}
                    {selectorWarnings.length ? (
                      <span className="warn-text">{selectorWarnings.join(" • ")}</span>
                    ) : null}
                    {!step.selector && selectorHints[step.action] ? (
                      <span className="muted">
                        Suggestions: {selectorHints[step.action].join(", ")}
                      </span>
                    ) : null}
                    {errors.selector ? <span className="error-text">{errors.selector}</span> : null}
                  </div>
                  <div className="form-field">
                    <label>Target URL</label>
                    <input
                      value={step.target ?? ""}
                      onChange={(event) => updateStep(index, { target: event.target.value })}
                    />
                    {errors.target ? <span className="error-text">{errors.target}</span> : null}
                  </div>
                  <div className="form-field">
                    <label>Value</label>
                    <input
                      value={step.value ?? ""}
                      onChange={(event) => updateStep(index, { value: event.target.value })}
                    />
                    {errors.value ? <span className="error-text">{errors.value}</span> : null}
                  </div>
                  <div className="form-field">
                    <label>Condition</label>
                    <input
                      value={step.condition ?? ""}
                      onChange={(event) => updateStep(index, { condition: event.target.value })}
                    />
                    {errors.condition ? <span className="error-text">{errors.condition}</span> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="action-row">
          <button className="btn primary" type="button" onClick={handleSave}>
            Save Flow
          </button>
          <span className="muted">{flowSaveStatus.startsWith("saved") ? "Saved" : flowSaveStatus}</span>
        </div>
      </Card>
    </div>
  );
};
