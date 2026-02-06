const overlayId = "password-cluster-overlay";
const captureId = "password-cluster-capture";
const highlightId = "password-cluster-highlight";
const STORAGE_KEY = "pc_flow_state";

const storageGet = (key: string) =>
  new Promise<any>((resolve) => {
    chrome.storage.local.get([key], (result) => resolve(result[key]));
  });

const storageSet = (key: string, value: any) =>
  new Promise<void>((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });

const storageClear = (key: string) =>
  new Promise<void>((resolve) => {
    chrome.storage.local.remove([key], () => resolve());
  });

const resolveValue = (template: string, bindings: Record<string, string>) =>
  template.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key) => bindings[key] ?? "");

const matchesDomain = (domain: string, hostname: string) =>
  hostname === domain || hostname.endsWith(`.${domain}`);

const removeOverlay = () => {
  const existing = document.getElementById(overlayId);
  if (existing) {
    existing.remove();
  }
};

const clearHighlight = () => {
  const existing = document.getElementById(highlightId);
  if (existing) {
    existing.remove();
  }
};

const removeCaptureBanner = () => {
  const existing = document.getElementById(captureId);
  if (existing) {
    existing.remove();
  }
};

const cssEscape = (value: string) => {
  if (typeof (window as any).CSS?.escape === "function") {
    return (window as any).CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
};

const buildSelector = (element: Element) => {
  if (!(element instanceof HTMLElement)) {
    return element.tagName.toLowerCase();
  }

  if (element.id) {
    return `#${cssEscape(element.id)}`;
  }

  const testId = element.getAttribute("data-testid");
  if (testId) {
    return `[data-testid="${cssEscape(testId)}"]`;
  }

  const name = element.getAttribute("name");
  if (name) {
    return `[name="${cssEscape(name)}"]`;
  }

  const aria = element.getAttribute("aria-label");
  if (aria) {
    return `[aria-label="${cssEscape(aria)}"]`;
  }

  const classes = Array.from(element.classList).filter(Boolean);
  if (classes.length > 0) {
    return `${element.tagName.toLowerCase()}.${cssEscape(classes[0])}`;
  }

  return element.tagName.toLowerCase();
};

const showHighlight = (selector: string | undefined) => {
  clearHighlight();
  if (!selector) return;
  const element = document.querySelector(selector) as HTMLElement | null;
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const highlight = document.createElement("div");
  highlight.id = highlightId;
  highlight.style.position = "fixed";
  highlight.style.top = `${rect.top - 4}px`;
  highlight.style.left = `${rect.left - 4}px`;
  highlight.style.width = `${rect.width + 8}px`;
  highlight.style.height = `${rect.height + 8}px`;
  highlight.style.border = "2px solid #2c7be5";
  highlight.style.borderRadius = "8px";
  highlight.style.boxShadow = "0 0 0 3px rgba(44,123,229,0.15)";
  highlight.style.zIndex = "2147483646";
  highlight.style.pointerEvents = "none";
  document.body.appendChild(highlight);
};

const createOverlay = (flow: any, requestId: string) => {
  removeOverlay();

  const overlay = document.createElement("div");
  overlay.id = overlayId;
  overlay.style.position = "fixed";
  overlay.style.top = "24px";
  overlay.style.right = "24px";
  overlay.style.width = "320px";
  overlay.style.zIndex = "2147483647";
  overlay.style.background = "#ffffff";
  overlay.style.border = "1px solid #dde6ed";
  overlay.style.borderRadius = "16px";
  overlay.style.boxShadow = "0 10px 30px rgba(12,20,28,0.2)";
  overlay.style.fontFamily = "IBM Plex Sans, system-ui, sans-serif";
  overlay.style.padding = "16px";

  const title = document.createElement("div");
  title.textContent = "Password Cluster";
  title.style.fontWeight = "600";
  title.style.marginBottom = "8px";

  const subtitle = document.createElement("div");
  subtitle.textContent = flow.domain;
  subtitle.style.color = "#3a4e5e";
  subtitle.style.fontSize = "12px";
  subtitle.style.marginBottom = "12px";

  const progressWrap = document.createElement("div");
  progressWrap.style.display = "grid";
  progressWrap.style.gap = "6px";
  progressWrap.style.marginBottom = "12px";

  const progressText = document.createElement("div");
  progressText.style.fontSize = "12px";
  progressText.style.color = "#3a4e5e";

  const progressTrack = document.createElement("div");
  progressTrack.style.height = "6px";
  progressTrack.style.borderRadius = "999px";
  progressTrack.style.background = "#eef3f7";

  const progressBar = document.createElement("div");
  progressBar.style.height = "6px";
  progressBar.style.borderRadius = "999px";
  progressBar.style.background = "#2c7be5";
  progressBar.style.width = "0%";

  progressTrack.appendChild(progressBar);
  progressWrap.appendChild(progressText);
  progressWrap.appendChild(progressTrack);

  const list = document.createElement("div");
  list.style.display = "grid";
  list.style.gap = "8px";
  list.style.maxHeight = "220px";
  list.style.overflow = "auto";

  const assistPanel = document.createElement("div");
  assistPanel.style.display = "none";
  assistPanel.style.marginTop = "12px";
  assistPanel.style.borderRadius = "12px";
  assistPanel.style.border = "1px solid #f3d1a1";
  assistPanel.style.background = "#fff7eb";
  assistPanel.style.padding = "10px";

  const assistTitle = document.createElement("div");
  assistTitle.textContent = "Action required";
  assistTitle.style.fontWeight = "600";
  assistTitle.style.marginBottom = "6px";

  const assistText = document.createElement("div");
  assistText.textContent = "Complete the step on the page, then resume.";
  assistText.style.fontSize = "12px";
  assistText.style.color = "#7a5a2b";

  const assistCountdown = document.createElement("div");
  assistCountdown.style.fontSize = "12px";
  assistCountdown.style.marginTop = "6px";
  assistCountdown.style.color = "#7a5a2b";

  const assistButton = document.createElement("button");
  assistButton.textContent = "Resume";
  assistButton.style.marginTop = "10px";
  assistButton.style.width = "100%";
  assistButton.style.border = "1px solid #f3d1a1";
  assistButton.style.borderRadius = "10px";
  assistButton.style.padding = "8px";
  assistButton.style.background = "#fff";
  assistButton.style.cursor = "pointer";

  assistPanel.appendChild(assistTitle);
  assistPanel.appendChild(assistText);
  assistPanel.appendChild(assistCountdown);
  assistPanel.appendChild(assistButton);

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.marginTop = "12px";
  cancelBtn.style.width = "100%";
  cancelBtn.style.border = "1px solid #dde6ed";
  cancelBtn.style.borderRadius = "10px";
  cancelBtn.style.padding = "8px";
  cancelBtn.style.background = "transparent";
  cancelBtn.style.cursor = "pointer";

  cancelBtn.addEventListener("click", async () => {
    chrome.runtime.sendMessage({
      type: "content:flow-error",
      requestId,
      error: "User cancelled"
    });
    await storageClear(STORAGE_KEY);
    removeOverlay();
    clearHighlight();
  });

  const controls = document.createElement("div");
  controls.style.display = "grid";
  controls.style.gridTemplateColumns = "1fr 1fr";
  controls.style.gap = "8px";
  controls.style.marginTop = "12px";

  const pauseBtn = document.createElement("button");
  pauseBtn.textContent = "Pause";
  pauseBtn.style.width = "100%";
  pauseBtn.style.border = "1px solid #dde6ed";
  pauseBtn.style.borderRadius = "10px";
  pauseBtn.style.padding = "8px";
  pauseBtn.style.background = "#f7f3ea";
  pauseBtn.style.cursor = "pointer";

  controls.appendChild(pauseBtn);
  controls.appendChild(cancelBtn);

  overlay.appendChild(title);
  overlay.appendChild(subtitle);
  overlay.appendChild(progressWrap);
  overlay.appendChild(list);
  overlay.appendChild(assistPanel);
  overlay.appendChild(controls);

  document.body.appendChild(overlay);

  let resumeResolver: (() => void) | null = null;
  let manualPaused = false;
  let manualResumeResolver: (() => void) | null = null;
  let countdownInterval: number | null = null;

  const clearCountdown = () => {
    if (countdownInterval) {
      window.clearInterval(countdownInterval);
      countdownInterval = null;
    }
  };

  assistButton.addEventListener("click", () => {
    assistPanel.style.display = "none";
    clearCountdown();
    if (resumeResolver) {
      resumeResolver();
      resumeResolver = null;
    }
  });

  pauseBtn.addEventListener("click", () => {
    manualPaused = !manualPaused;
    pauseBtn.textContent = manualPaused ? "Resume" : "Pause";
    if (!manualPaused && manualResumeResolver) {
      manualResumeResolver();
      manualResumeResolver = null;
    }
  });

  const renderSteps = (currentIndex: number) => {
    list.innerHTML = "";
    flow.steps.forEach((step: any, index: number) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.padding = "8px";
      row.style.borderRadius = "8px";
      row.style.background = index === currentIndex ? "#eef3f7" : "#f7f3ea";
      row.innerHTML = `<span>${step.label}</span><span style=\"font-size:11px;color:#2a3b47\">${step.action}</span>`;
      list.appendChild(row);
    });
    const total = flow.steps.length;
    const progress = total > 0 ? Math.min((currentIndex / total) * 100, 100) : 0;
    progressText.textContent = `Step ${Math.min(currentIndex + 1, total)} of ${total}`;
    progressBar.style.width = `${progress}%`;
  };

  const waitForResume = (options?: {
    title?: string;
    message?: string;
    countdownSeconds?: number;
    buttonLabel?: string;
  }) =>
    new Promise<void>((resolve) => {
      assistTitle.textContent = options?.title ?? "Action required";
      assistText.textContent = options?.message ?? "Complete the step on the page, then resume.";
      assistButton.textContent = options?.buttonLabel ?? "Resume";
      assistCountdown.textContent = "";
      clearCountdown();

      if (options?.countdownSeconds && options.countdownSeconds > 0) {
        let remaining = options.countdownSeconds;
        assistCountdown.textContent = `Time left: ${remaining}s`;
        countdownInterval = window.setInterval(() => {
          remaining -= 1;
          assistCountdown.textContent = `Time left: ${Math.max(remaining, 0)}s`;
          if (remaining <= 0) {
            clearCountdown();
          }
        }, 1000);
      }

      assistPanel.style.display = "block";
      resumeResolver = resolve;
    });

  const waitForManualResume = () =>
    new Promise<void>((resolve) => {
      if (!manualPaused) {
        resolve();
        return;
      }
      manualResumeResolver = resolve;
    });

  const isPaused = () => manualPaused;

  return { renderSteps, waitForResume, waitForManualResume, isPaused, showHighlight, clearHighlight };
};

const startSelectorCapture = (requestId: string) => {
  removeCaptureBanner();

  const banner = document.createElement("div");
  banner.id = captureId;
  banner.style.position = "fixed";
  banner.style.bottom = "24px";
  banner.style.right = "24px";
  banner.style.zIndex = "2147483647";
  banner.style.background = "#111827";
  banner.style.color = "#ffffff";
  banner.style.padding = "10px 14px";
  banner.style.borderRadius = "12px";
  banner.style.fontSize = "12px";
  banner.style.fontFamily = "IBM Plex Sans, system-ui, sans-serif";
  banner.textContent = "Click an element to capture its selector (Esc to cancel)";
  document.body.appendChild(banner);

  const cleanup = () => {
    document.removeEventListener("click", clickHandler, true);
    document.removeEventListener("keydown", keyHandler, true);
    removeCaptureBanner();
  };

  const clickHandler = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as Element | null;
    const selector = target ? buildSelector(target) : null;
    chrome.runtime.sendMessage({
      type: "content:selector-capture-result",
      requestId,
      selector
    });
    cleanup();
  };

  const keyHandler = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      chrome.runtime.sendMessage({
        type: "content:selector-capture-result",
        requestId,
        selector: null
      });
      cleanup();
    }
  };

  document.addEventListener("click", clickHandler, true);
  document.addEventListener("keydown", keyHandler, true);
};

const waitFor = async (selector: string, timeout = 15000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const element = document.querySelector(selector) as HTMLElement | null;
    if (element) {
      return element;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Timeout waiting for ${selector}`);
};

const executeStep = async (step: any, bindings: Record<string, string>) => {
  if (step.action === "navigate" && step.target) {
    window.location.assign(step.target);
    return "navigated";
  }

  if (step.action === "click" && step.selector) {
    const element = await waitFor(step.selector);
    (element as HTMLElement).click();
    return;
  }

  if (step.action === "type" && step.selector) {
    const element = await waitFor(step.selector) as HTMLInputElement;
    const value = resolveValue(step.value ?? "", bindings);
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  if (step.action === "select" && step.selector) {
    const element = await waitFor(step.selector) as HTMLSelectElement;
    const value = resolveValue(step.value ?? "", bindings);
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  if (step.action === "wait_for") {
    if (step.selector) {
      await waitFor(step.selector);
    } else if (step.condition?.startsWith("text=")) {
      const targetText = step.condition.replace("text=", "");
      const start = Date.now();
      while (Date.now() - start < 15000) {
        if (document.body?.innerText?.includes(targetText)) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      throw new Error(`Timeout waiting for text ${targetText}`);
    }
    return;
  }

  if (step.action === "assert_text" && step.selector) {
    const element = await waitFor(step.selector);
    const value = resolveValue(step.value ?? "", bindings);
    if (!element.textContent?.includes(value)) {
      throw new Error(`Assertion failed for ${step.selector}`);
    }
    return;
  }

  if (step.action === "assert_element" && step.selector) {
    await waitFor(step.selector);
    return;
  }

  if (step.action === "pause_for_user") {
    return "pause";
  }
};

const runFlow = async (state: any) => {
  const { flow, requestId, bindings } = state;
  const overlay = createOverlay(flow, requestId);

  for (let index = state.stepIndex ?? 0; index < flow.steps.length; index += 1) {
    const step = flow.steps[index];
    overlay.renderSteps(index);

    chrome.runtime.sendMessage({
      type: "content:step-start",
      requestId,
      stepId: step.id,
      label: step.label
    });

    try {
      if (overlay.isPaused()) {
        await overlay.waitForManualResume();
      }
      if (step.mode === "guided") {
        overlay.showHighlight(step.selector);
        chrome.runtime.sendMessage({
          type: "content:step-paused",
          requestId,
          stepId: step.id,
          label: step.label
        });
        await overlay.waitForResume({
          title: "Guided step",
          message: step.label,
          buttonLabel: "Run step"
        });
      }
      const result = await executeStep(step, bindings);
      if (result === "navigated") {
        await storageSet(STORAGE_KEY, { ...state, stepIndex: index + 1 });
        chrome.runtime.sendMessage({
          type: "content:step-complete",
          requestId,
          stepId: step.id,
          label: step.label
        });
        return;
      }
      if (result === "pause") {
        chrome.runtime.sendMessage({
          type: "content:step-paused",
          requestId,
          stepId: step.id,
          label: step.label
        });
        await overlay.waitForResume({
          title: "MFA required",
          message: "Complete the verification step on the page, then resume.",
          countdownSeconds: 120,
          buttonLabel: "Resume"
        });
        chrome.runtime.sendMessage({
          type: "content:step-complete",
          requestId,
          stepId: step.id,
          label: step.label
        });
        continue;
      }
      chrome.runtime.sendMessage({
        type: "content:step-complete",
        requestId,
        stepId: step.id,
        label: step.label
      });
      overlay.clearHighlight();
    } catch (error: any) {
      chrome.runtime.sendMessage({
        type: "content:flow-error",
        requestId,
        error: error?.message ?? "Step failed"
      });
      await storageClear(STORAGE_KEY);
      removeOverlay();
      clearHighlight();
      return;
    }
  }

  chrome.runtime.sendMessage({ type: "content:flow-complete", requestId });
  await storageClear(STORAGE_KEY);
  removeOverlay();
  clearHighlight();
};

const resumeIfNeeded = async () => {
  const state = await storageGet(STORAGE_KEY);
  if (!state?.flow?.domain) {
    return;
  }
  if (!matchesDomain(state.flow.domain, window.location.hostname)) {
    return;
  }
  runFlow(state);
};

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "content:run-flow") {
    const state = {
      requestId: message.payload.requestId,
      flow: message.payload.flow,
      bindings: message.payload.bindings,
      stepIndex: 0
    };
    storageSet(STORAGE_KEY, state).then(() => runFlow(state));
  }
  if (message?.type === "content:selector-test") {
    const selector = message.selector as string;
    const found = Boolean(selector && document.querySelector(selector));
    chrome.runtime.sendMessage({
      type: "content:selector-test-result",
      requestId: message.requestId,
      selector,
      found
    });
  }
  if (message?.type === "content:selector-capture") {
    startSelectorCapture(message.requestId);
  }
});

const domain = window.location.hostname;
chrome.runtime.sendMessage({ type: "content:site-detected", domain });
resumeIfNeeded();
