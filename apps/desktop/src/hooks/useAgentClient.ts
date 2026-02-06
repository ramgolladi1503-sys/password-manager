import { useEffect, useMemo, useRef, useState } from "react";
import {
  PROTOCOL_VERSION,
  type AgentMessage,
  type ExtensionMessage,
  type FlowDetail,
  type FlowSummary,
  type RotationUpdate
} from "@password-cluster/protocol";

const AGENT_URL = import.meta.env?.VITE_AGENT_URL ?? "ws://localhost:8787";

type AgentState = {
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

export const useAgentClient = (): AgentState => {
  const [connected, setConnected] = useState(false);
  const [flows, setFlows] = useState<FlowSummary[]>([]);
  const [flowDetail, setFlowDetail] = useState<FlowDetail | null>(null);
  const [rotationEvents, setRotationEvents] = useState<RotationUpdate[]>([]);
  const [flowSaveStatus, setFlowSaveStatus] = useState("idle");
  const [selectorTests, setSelectorTests] = useState<Record<string, boolean>>({});
  const [selectorCaptures, setSelectorCaptures] = useState<Record<string, string | null>>({});
  const socketRef = useRef<WebSocket | null>(null);

  const send = (message: ExtensionMessage) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  const requestFlows = () => {
    send({ type: "ext:flow-list-request" });
  };

  const requestFlowDetail = (flowId: string) => {
    send({ type: "ext:flow-detail-request", flowId });
  };

  const saveFlow = (flow: FlowDetail) => {
    setFlowSaveStatus("saving");
    send({ type: "ext:flow-save", flow });
  };

  const testSelector = (selector: string) => {
    const requestId = `sel-${Date.now()}`;
    send({ type: "ext:selector-test", requestId, selector });
  };

  const captureSelector = () => {
    const requestId = `cap-${Date.now()}`;
    send({ type: "ext:selector-capture", requestId });
    return requestId;
  };

  const startRotation = (payload: {
    flowId: string;
    accountId: string;
    domain: string;
    bindings: Record<string, string>;
    driver?: "playwright" | "extension";
  }) => {
    const requestId = `ui-${Date.now()}`;
    setRotationEvents([]);
    send({
      type: "ext:rotate-request",
      requestId,
      flowId: payload.flowId,
      accountId: payload.accountId,
      domain: payload.domain,
      bindings: payload.bindings,
      driver: payload.driver
    });
  };

  useEffect(() => {
    const socket = new WebSocket(AGENT_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      send({ type: "ext:hello", clientId: "desktop", version: PROTOCOL_VERSION });
      requestFlows();
    };

    socket.onclose = () => {
      setConnected(false);
      setTimeout(() => {
        setRotationEvents((events) => [...events, {
          type: "agent:rotation-update",
          requestId: "system",
          status: "failed",
          message: "Agent disconnected"
        }]);
      }, 0);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as AgentMessage;

      if (message.type === "agent:hello") {
        setFlows(message.flows);
      }

      if (message.type === "agent:flow-list") {
        setFlows(message.flows);
      }

      if (message.type === "agent:flow-detail") {
        setFlowDetail(message.flow);
      }

      if (message.type === "agent:rotation-update") {
        setRotationEvents((prev) => [...prev, message]);
      }

      if (message.type === "agent:flow-saved") {
        setFlowSaveStatus(`saved:${message.flowId}`);
      }

      if (message.type === "agent:selector-test-result") {
        setSelectorTests((prev) => ({ ...prev, [message.selector]: message.found }));
      }

      if (message.type === "agent:selector-capture-result") {
        setSelectorCaptures((prev) => ({ ...prev, [message.requestId]: message.selector }));
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return useMemo(
    () => ({
      connected,
      flows,
      flowDetail,
      rotationEvents,
      flowSaveStatus,
      selectorTests,
      selectorCaptures,
      requestFlowDetail,
      requestFlows,
      saveFlow,
      testSelector,
      captureSelector,
      startRotation
    }),
    [connected, flows, flowDetail, rotationEvents, flowSaveStatus, selectorTests, selectorCaptures]
  );
};
