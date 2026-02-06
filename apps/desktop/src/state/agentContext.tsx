import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useAgentClient } from "../hooks/useAgentClient";
import type { FlowDetail, FlowSummary, RotationUpdate } from "@password-cluster/protocol";

export type AgentContextState = {
  connected: boolean;
  flows: FlowSummary[];
  flowDetail: FlowDetail | null;
  rotationEvents: RotationUpdate[];
  flowSaveStatus: string;
  selectorTests: Record<string, boolean>;
  selectorCaptures: Record<string, string | null>;
  requestFlowDetail: (flowId: string) => void;
  requestFlows: () => void;
  saveFlow: (flow: FlowDetail) => void;
  testSelector: (selector: string) => void;
  captureSelector: () => string;
  startRotation: (payload: {
    flowId: string;
    accountId: string;
    domain: string;
    bindings: Record<string, string>;
    driver?: "playwright" | "extension";
  }) => void;
};

const AgentContext = createContext<AgentContextState | null>(null);

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const agent = useAgentClient();
  return <AgentContext.Provider value={agent}>{children}</AgentContext.Provider>;
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("Agent context unavailable");
  }
  return context;
};
