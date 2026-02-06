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

export type FlowTemplate = {
  id: string;
  domain: string;
  version: string;
  modeSupport: Array<"auto" | "guided" | "manual">;
  requires: {
    authenticatedSession: boolean;
    mfaSupported: boolean;
    captchaHandled: "pause" | "manual" | "ignore";
    loginUrl?: string;
  };
  bindings: string[];
  steps: FlowStep[];
  verify?: Array<{
    id: string;
    label: string;
    action: string;
    using?: string;
    selector?: string;
    value?: string;
    timeoutSeconds?: number;
  }>;
};

export type FlowBindings = Record<string, string>;

export type RotationEvent = {
  status: "started" | "step-start" | "step-complete" | "paused" | "completed" | "failed";
  stepId?: string;
  message?: string;
};
