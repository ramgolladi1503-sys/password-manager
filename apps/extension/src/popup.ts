import type { AgentMessage, FlowSummary } from "./protocol";

const statusEl = document.querySelector<HTMLSpanElement>("#status");
const domainEl = document.querySelector<HTMLSpanElement>("#domain");
const flowSelect = document.querySelector<HTMLSelectElement>("#flowSelect");
const rotateBtn = document.querySelector<HTMLButtonElement>("#rotateBtn");
const refreshBtn = document.querySelector<HTMLButtonElement>("#refreshBtn");
const logEl = document.querySelector<HTMLDivElement>("#log");

let flows: FlowSummary[] = [];
let lastDomain = "";

const renderFlows = () => {
  if (!flowSelect) {
    return;
  }
  flowSelect.innerHTML = "";
  flows.forEach((flow) => {
    const option = document.createElement("option");
    option.value = flow.id;
    option.textContent = `${flow.domain} (${flow.modeSupport.join(", ")})`;
    flowSelect.appendChild(option);
  });
};

const log = (message: string) => {
  if (logEl) {
    const entry = document.createElement("div");
    entry.textContent = message;
    logEl.prepend(entry);
  }
};

chrome.runtime.sendMessage({ type: "popup:ready" }, (response) => {
  if (!response) {
    return;
  }
  statusEl!.textContent = response.connected ? "Connected" : "Disconnected";
  flows = response.flows ?? [];
  lastDomain = response.lastDomain ?? "";
  domainEl!.textContent = lastDomain || "No active domain";
  renderFlows();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "ext:status") {
    statusEl!.textContent = message.connected ? "Connected" : "Disconnected";
  }

  if (message?.type === "ext:site") {
    lastDomain = message.domain;
    domainEl!.textContent = lastDomain;
  }

  if (message?.type === "agent:update") {
    const payload = message.payload as AgentMessage;
    if (payload.type === "agent:flow-list" || payload.type === "agent:hello") {
      flows = payload.flows;
      renderFlows();
    }
    if (payload.type === "agent:rotation-update") {
      log(`${payload.status}: ${payload.message ?? ""}`);
    }
  }
});

rotateBtn?.addEventListener("click", () => {
  const selectedFlow = flowSelect?.value;
  if (!selectedFlow) {
    log("Select a flow first");
    return;
  }

  const requestId = `req-${Date.now()}`;
  chrome.runtime.sendMessage({
    type: "popup:rotate-request",
    requestId,
    flowId: selectedFlow,
    accountId: "demo-account",
    domain: lastDomain || "unknown",
    bindings: {
      old_password: "current",
      new_password: "new-pass-123"
    }
  });
});

refreshBtn?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "popup:refresh-flows" });
});
