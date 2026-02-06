import { WebSocketServer } from "ws";
import { computePriority } from "@password-cluster/core";
import {
  PROTOCOL_VERSION,
  isExtensionMessage,
  safeJsonParse,
  type AgentMessage,
  type ExtensionMessage,
  type FlowDetailRequest,
  type FlowSaveRequest,
  type RotateRequest,
  type SelectorTestRequest,
  type SelectorTestResult,
  type SelectorCaptureRequest,
  type SelectorCaptureResult,
  type TabFlowComplete,
  type TabFlowError,
  type TabStepUpdate
} from "@password-cluster/protocol";
import { flowSummaries, getFlow, saveFlow } from "./flowStore";
import { runFlow } from "./flowRunner";

const PORT = Number(process.env.AGENT_PORT ?? 8787);
const agentVersion = "0.1.0";

const server = new WebSocketServer({ port: PORT });
const clients = new Set<WebSocket>();
const clientIds = new Map<WebSocket, string>();

const send = (socket: { send: (payload: string) => void }, message: AgentMessage) => {
  socket.send(JSON.stringify(message));
};

const broadcast = (message: AgentMessage) => {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    client.send(payload);
  }
};

server.on("connection", (socket) => {
  clients.add(socket);
  send(socket, {
    type: "agent:hello",
    agentVersion,
    protocolVersion: PROTOCOL_VERSION,
    flows: flowSummaries()
  });

  socket.on("close", () => {
    clients.delete(socket);
    clientIds.delete(socket);
  });

  socket.on("message", async (raw) => {
    const parsed = safeJsonParse(raw.toString());
    if (!isExtensionMessage(parsed)) {
      return;
    }

    const message = parsed as ExtensionMessage;

    if (message.type === "ext:hello") {
      clientIds.set(socket, message.clientId);
      send(socket, { type: "agent:client-list", clients: Array.from(clientIds.values()) });
      broadcast({ type: "agent:client-connected", clientId: message.clientId });
      return;
    }

    if (message.type === "ext:flow-list-request") {
      send(socket, { type: "agent:flow-list", flows: flowSummaries() });
      return;
    }

    if (message.type === "ext:flow-detail-request") {
      const request = message as FlowDetailRequest;
      const flow = getFlow(request.flowId);
      if (!flow) {
        send(socket, {
          type: "agent:error",
          message: `Flow not found: ${request.flowId}`
        });
        return;
      }
      send(socket, {
        type: "agent:flow-detail",
        flow: {
          id: flow.id,
          domain: flow.domain,
          modeSupport: flow.modeSupport,
          version: flow.version,
          bindings: flow.bindings,
          steps: flow.steps,
          verify: flow.verify
        }
      });
      return;
    }

    if (message.type === "ext:flow-save") {
      const request = message as FlowSaveRequest;
      saveFlow(request.flow as any);
      broadcast({ type: "agent:flow-saved", flowId: request.flow.id });
      broadcast({ type: "agent:flow-list", flows: flowSummaries() });
      return;
    }

    if (message.type === "ext:selector-test") {
      const request = message as SelectorTestRequest;
      broadcast({
        type: "agent:selector-test",
        requestId: request.requestId,
        selector: request.selector
      });
      return;
    }

    if (message.type === "ext:selector-test-result") {
      const result = message as SelectorTestResult;
      broadcast({
        type: "agent:selector-test-result",
        requestId: result.requestId,
        selector: result.selector,
        found: result.found
      });
      return;
    }

    if (message.type === "ext:selector-capture") {
      const request = message as SelectorCaptureRequest;
      broadcast({
        type: "agent:selector-capture",
        requestId: request.requestId
      });
      return;
    }

    if (message.type === "ext:selector-capture-result") {
      const result = message as SelectorCaptureResult;
      broadcast({
        type: "agent:selector-capture-result",
        requestId: result.requestId,
        selector: result.selector
      });
      return;
    }

    if (message.type === "ext:tab-step") {
      const update = message as TabStepUpdate;
      broadcast({
        type: "agent:rotation-update",
        requestId: update.requestId,
        status: update.status,
        stepId: update.stepId,
        message: update.message
      });
      return;
    }

    if (message.type === "ext:tab-complete") {
      const update = message as TabFlowComplete;
      broadcast({
        type: "agent:rotation-update",
        requestId: update.requestId,
        status: "completed",
        message: update.message ?? "Flow completed on active tab"
      });
      return;
    }

    if (message.type === "ext:tab-error") {
      const update = message as TabFlowError;
      broadcast({
        type: "agent:rotation-update",
        requestId: update.requestId,
        status: "failed",
        message: update.message
      });
      return;
    }

    if (message.type === "ext:rotate-request") {
      const request = message as RotateRequest;
      const flow = getFlow(request.flowId);

      if (!flow) {
        send(socket, {
          type: "agent:error",
          requestId: request.requestId,
          message: `Flow not found: ${request.flowId}`
        });
        return;
      }

      const priority = request.signals ? computePriority(request.signals) : 0;

      if (request.driver === "extension") {
        broadcast({
          type: "agent:rotation-update",
          requestId: request.requestId,
          status: "started",
          message: `Starting flow ${flow.id} on active tab`,
          priority
        });

        broadcast({
          type: "agent:execute-on-tab",
          requestId: request.requestId,
          flow: {
            id: flow.id,
            domain: flow.domain,
            modeSupport: flow.modeSupport,
            version: flow.version,
            bindings: flow.bindings,
            steps: flow.steps,
            verify: flow.verify
          },
          bindings: request.bindings,
          domain: request.domain
        });
        return;
      }

      broadcast({
        type: "agent:rotation-update",
        requestId: request.requestId,
        status: "started",
        message: `Starting flow ${flow.id}`,
        priority
      });

      await runFlow(flow, request.bindings, (event) => {
        broadcast({
          type: "agent:rotation-update",
          requestId: request.requestId,
          status: event.status,
          stepId: event.stepId,
          message: event.message,
          priority
        });
      });
    }
  });
});

console.log(`Password Cluster agent listening on ws://localhost:${PORT}`);
