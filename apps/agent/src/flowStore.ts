import fs from "node:fs";
import path from "node:path";
import type { FlowTemplate } from "./types";

const flowsDir = process.env.FLOWS_DIR
  ? path.resolve(process.env.FLOWS_DIR)
  : path.resolve(process.cwd(), "flows");

let cachedFlows: FlowTemplate[] | null = null;

const loadFlows = (): FlowTemplate[] => {
  if (!fs.existsSync(flowsDir)) {
    return [];
  }

  const files = fs.readdirSync(flowsDir).filter((file) => file.endsWith(".json"));
  const flows: FlowTemplate[] = [];

  for (const file of files) {
    const filePath = path.join(flowsDir, file);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      flows.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return flows;
};

export const listFlows = (): FlowTemplate[] => {
  if (!cachedFlows) {
    cachedFlows = loadFlows();
  }
  return cachedFlows;
};

export const getFlow = (id: string): FlowTemplate | undefined =>
  listFlows().find((flow) => flow.id === id);

export const flowSummaries = () =>
  listFlows().map((flow) => ({
    id: flow.id,
    domain: flow.domain,
    modeSupport: flow.modeSupport
  }));

export const saveFlow = (flow: FlowTemplate) => {
  const safeDomain = flow.domain.replace(/[^a-z0-9.-]/gi, "-");
  const fileName = `${safeDomain}.change-password.json`;
  const filePath = path.join(flowsDir, fileName);
  if (!fs.existsSync(flowsDir)) {
    fs.mkdirSync(flowsDir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(flow, null, 2));
  cachedFlows = null;
};
