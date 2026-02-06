import type { FlowBindings, FlowTemplate, RotationEvent } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Emit = (event: RotationEvent) => void;

const runFlowStub = async (flow: FlowTemplate, bindings: FlowBindings, emit: Emit) => {
  const missing = flow.bindings.filter((key) => !bindings[key]);
  if (missing.length > 0) {
    emit({ status: "failed", message: `Missing bindings: ${missing.join(", ")}` });
    return;
  }

  emit({ status: "started", message: `Running ${flow.id}` });

  for (const step of flow.steps) {
    emit({ status: "step-start", stepId: step.id, message: step.label });

    if (step.action === "pause_for_user") {
      emit({ status: "paused", stepId: step.id, message: step.label });
      return;
    }

    await delay(200);
    emit({ status: "step-complete", stepId: step.id, message: step.label });
  }

  if (flow.verify?.length) {
    for (const step of flow.verify) {
      emit({ status: "step-start", stepId: step.id, message: `Verify: ${step.label}` });
      await delay(150);
      emit({ status: "step-complete", stepId: step.id, message: `Verified: ${step.label}` });
    }
  }

  emit({ status: "completed", message: "Flow completed" });
};

export const runFlow = async (
  flow: FlowTemplate,
  bindings: FlowBindings,
  emit: Emit
) => {
  if (process.env.AGENT_DRIVER === "playwright") {
    const { runFlowWithPlaywright } = await import("./playwrightRunner");
    await runFlowWithPlaywright(flow, bindings, emit);
    return;
  }

  await runFlowStub(flow, bindings, emit);
};
