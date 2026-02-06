import type { AgentMessage, ExtensionMessage, FlowSummary } from "./protocol";

const AGENT_URL = "ws://localhost:8787";
const CLIENT_ID = "extension";
const VERSION = "0.1.0";

let socket: WebSocket | null = null;
let connected = false;
let flows: FlowSummary[] = [];
let lastDomain = "";

const broadcast = (payload: unknown) => {
  chrome.runtime.sendMessage(payload);
};

const connect = () => {
  socket = new WebSocket(AGENT_URL);

  socket.onopen = () => {
    connected = true;
    const hello: ExtensionMessage = { type: "ext:hello", clientId: CLIENT_ID, version: VERSION };
    socket?.send(JSON.stringify(hello));
    broadcast({ type: "ext:status", connected });
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as AgentMessage;
    if (message.type === "agent:hello" || message.type === "agent:flow-list") {
      flows = message.flows;
    }
    if (message.type === "agent:execute-on-tab") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId !== undefined) {
          chrome.tabs.sendMessage(tabId, {
            type: "content:run-flow",
            payload: message
          });
        }
      });
    }
    if (message.type === "agent:selector-test") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId !== undefined) {
          chrome.tabs.sendMessage(tabId, {
            type: "content:selector-test",
            requestId: message.requestId,
            selector: message.selector
          });
        }
      });
    }
    if (message.type === "agent:selector-capture") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId !== undefined) {
          chrome.tabs.sendMessage(tabId, {
            type: "content:selector-capture",
            requestId: message.requestId
          });
        }
      });
    }
    broadcast({ type: "agent:update", payload: message });
  };

  socket.onclose = () => {
    connected = false;
    broadcast({ type: "ext:status", connected });
    setTimeout(connect, 2000);
  };

  socket.onerror = () => {
    connected = false;
    broadcast({ type: "ext:status", connected });
  };
};

const sendToAgent = (message: ExtensionMessage) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "popup:ready") {
    sendResponse({ connected, flows, lastDomain });
    return true;
  }

  if (message?.type === "popup:refresh-flows") {
    sendToAgent({ type: "ext:flow-list-request" });
  }

  if (message?.type === "popup:rotate-request") {
    sendToAgent({
      type: "ext:rotate-request",
      requestId: message.requestId,
      flowId: message.flowId,
      accountId: message.accountId,
      domain: message.domain,
      bindings: message.bindings,
      signals: message.signals,
      driver: "extension"
    });
  }

  if (message?.type === "content:site-detected") {
    lastDomain = message.domain;
    broadcast({ type: "ext:site", domain: lastDomain });
  }

  if (message?.type === "content:step-start") {
    sendToAgent({
      type: "ext:tab-step",
      requestId: message.requestId,
      stepId: message.stepId,
      status: "step-start",
      message: message.label
    });
  }

  if (message?.type === "content:step-complete") {
    sendToAgent({
      type: "ext:tab-step",
      requestId: message.requestId,
      stepId: message.stepId,
      status: "step-complete",
      message: message.label
    });
  }

  if (message?.type === "content:step-paused") {
    sendToAgent({
      type: "ext:tab-step",
      requestId: message.requestId,
      stepId: message.stepId,
      status: "paused",
      message: message.label
    });
  }

  if (message?.type === "content:flow-complete") {
    sendToAgent({
      type: "ext:tab-complete",
      requestId: message.requestId,
      message: "Flow completed via extension"
    });
  }

  if (message?.type === "content:flow-error") {
    sendToAgent({
      type: "ext:tab-error",
      requestId: message.requestId,
      message: message.error ?? "Flow failed"
    });
  }

  if (message?.type === "content:selector-test-result") {
    sendToAgent({
      type: "ext:selector-test-result",
      requestId: message.requestId,
      selector: message.selector,
      found: message.found
    });
  }

  if (message?.type === "content:selector-capture-result") {
    sendToAgent({
      type: "ext:selector-capture-result",
      requestId: message.requestId,
      selector: message.selector ?? null
    });
  }

  return false;
});

connect();
