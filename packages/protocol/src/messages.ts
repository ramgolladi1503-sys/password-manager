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

export type ExtensionHello = {
  type: "ext:hello";
  clientId: string;
  version: string;
};

export type FlowListRequest = {
  type: "ext:flow-list-request";
};

export type FlowDetailRequest = {
  type: "ext:flow-detail-request";
  flowId: string;
};

export type RotateRequest = {
  type: "ext:rotate-request";
  requestId: string;
  flowId: string;
  accountId: string;
  domain: string;
  bindings: Record<string, string>;
  signals?: RiskSignals;
  driver?: "playwright" | "extension";
};

export type ExtensionMessage =
  | ExtensionHello
  | FlowListRequest
  | FlowDetailRequest
  | FlowSaveRequest
  | SelectorTestRequest
  | SelectorTestResult
  | SelectorCaptureRequest
  | SelectorCaptureResult
  | TabStepUpdate
  | TabFlowComplete
  | TabFlowError
  | RotateRequest;

export type AgentHello = {
  type: "agent:hello";
  agentVersion: string;
  protocolVersion: string;
  flows: FlowSummary[];
};

export type AgentStatus = {
  type: "agent:status";
  status: "ready" | "busy" | "disconnected";
};

export type FlowListResponse = {
  type: "agent:flow-list";
  flows: FlowSummary[];
};

export type FlowDetailResponse = {
  type: "agent:flow-detail";
  flow: FlowDetail;
};

export type FlowSaveRequest = {
  type: "ext:flow-save";
  flow: FlowDetail;
};

export type FlowSavedResponse = {
  type: "agent:flow-saved";
  flowId: string;
};

export type TabStepUpdate = {
  type: "ext:tab-step";
  requestId: string;
  stepId: string;
  status: "step-start" | "step-complete" | "paused" | "failed";
  message?: string;
};

export type TabFlowComplete = {
  type: "ext:tab-complete";
  requestId: string;
  message?: string;
};

export type TabFlowError = {
  type: "ext:tab-error";
  requestId: string;
  message: string;
};

export type SelectorTestRequest = {
  type: "ext:selector-test";
  requestId: string;
  selector: string;
};

export type SelectorTestResult = {
  type: "ext:selector-test-result";
  requestId: string;
  selector: string;
  found: boolean;
};

export type SelectorCaptureRequest = {
  type: "ext:selector-capture";
  requestId: string;
};

export type SelectorCaptureResult = {
  type: "ext:selector-capture-result";
  requestId: string;
  selector: string | null;
};

export type RotationUpdate = {
  type: "agent:rotation-update";
  requestId: string;
  status: "started" | "step-start" | "step-complete" | "paused" | "completed" | "failed";
  stepId?: string;
  message?: string;
  priority?: number;
};

export type AgentError = {
  type: "agent:error";
  requestId?: string;
  message: string;
};

export type AgentMessage =
  | AgentHello
  | AgentStatus
  | FlowListResponse
  | FlowDetailResponse
  | FlowSavedResponse
  | AgentExecuteOnTab
  | AgentSelectorTest
  | AgentSelectorTestResult
  | AgentSelectorCapture
  | AgentSelectorCaptureResult
  | AgentClientConnected
  | AgentClientList
  | RotationUpdate
  | AgentError;

export type AgentExecuteOnTab = {
  type: "agent:execute-on-tab";
  requestId: string;
  flow: FlowDetail;
  bindings: Record<string, string>;
  domain: string;
};

export type AgentSelectorTest = {
  type: "agent:selector-test";
  requestId: string;
  selector: string;
};

export type AgentSelectorTestResult = {
  type: "agent:selector-test-result";
  requestId: string;
  selector: string;
  found: boolean;
};

export type AgentSelectorCapture = {
  type: "agent:selector-capture";
  requestId: string;
};

export type AgentSelectorCaptureResult = {
  type: "agent:selector-capture-result";
  requestId: string;
  selector: string | null;
};

export type AgentClientConnected = {
  type: "agent:client-connected";
  clientId: string;
};

export type AgentClientList = {
  type: "agent:client-list";
  clients: string[];
};
