export type RiskSignals = {
  weak: boolean;
  reused: boolean;
  breached: boolean;
  old: boolean;
  score: number;
  ageDays: number;
};

export type FlowSummary = {
  id: string;
  domain: string;
  modeSupport: Array<"auto" | "guided" | "manual">;
};

export type FlowStep = {
  id: string;
  label: string;
  mode: "auto" | "guided" | "manual";
  action: string;
  selector?: string;
  target?: string;
  value?: string;
  condition?: string;
};

export type FlowVerifyStep = {
  id: string;
  label: string;
  action: string;
  using?: string;
  selector?: string;
  value?: string;
  timeoutSeconds?: number;
};

export type FlowDetail = FlowSummary & {
  version: string;
  bindings: string[];
  steps: FlowStep[];
  verify?: FlowVerifyStep[];
};

export type ExtensionMessage =
  | { type: "ext:hello"; clientId: string; version: string }
  | { type: "ext:flow-list-request" }
  | { type: "ext:flow-detail-request"; flowId: string }
  | { type: "ext:flow-save"; flow: FlowDetail }
  | {
      type: "ext:rotate-request";
      requestId: string;
      flowId: string;
      accountId: string;
      domain: string;
      bindings: Record<string, string>;
      signals?: RiskSignals;
      driver?: "playwright" | "extension";
    }
  | { type: "ext:selector-test"; requestId: string; selector: string }
  | { type: "ext:selector-test-result"; requestId: string; selector: string; found: boolean }
  | { type: "ext:selector-capture"; requestId: string }
  | { type: "ext:selector-capture-result"; requestId: string; selector: string | null }
  | {
      type: "ext:tab-step";
      requestId: string;
      stepId: string;
      status: "step-start" | "step-complete" | "paused" | "failed";
      message?: string;
    }
  | { type: "ext:tab-complete"; requestId: string; message?: string }
  | { type: "ext:tab-error"; requestId: string; message: string };

export type AgentMessage =
  | {
      type: "agent:hello";
      agentVersion: string;
      protocolVersion: string;
      flows: FlowSummary[];
    }
  | { type: "agent:status"; status: "ready" | "busy" | "disconnected" }
  | { type: "agent:flow-list"; flows: FlowSummary[] }
  | { type: "agent:flow-detail"; flow: FlowDetail }
  | { type: "agent:flow-saved"; flowId: string }
  | { type: "agent:selector-test"; requestId: string; selector: string }
  | { type: "agent:selector-test-result"; requestId: string; selector: string; found: boolean }
  | { type: "agent:client-connected"; clientId: string }
  | { type: "agent:client-list"; clients: string[] }
  | { type: "agent:selector-capture"; requestId: string }
  | { type: "agent:selector-capture-result"; requestId: string; selector: string | null }
  | {
      type: "agent:execute-on-tab";
      requestId: string;
      flow: FlowDetail;
      bindings: Record<string, string>;
      domain: string;
    }
  | {
      type: "agent:rotation-update";
      requestId: string;
      status: "started" | "step-start" | "step-complete" | "paused" | "completed" | "failed";
      stepId?: string;
      message?: string;
      priority?: number;
    }
  | { type: "agent:error"; requestId?: string; message: string };
