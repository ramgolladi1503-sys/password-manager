import type { AgentMessage, ExtensionMessage } from "./messages";

export * from "./messages";

export const PROTOCOL_VERSION = "1.0";

export const isExtensionMessage = (payload: unknown): payload is ExtensionMessage => {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  const type = (payload as { type?: string }).type;
  return typeof type === "string" && type.startsWith("ext:");
};

export const isAgentMessage = (payload: unknown): payload is AgentMessage => {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  const type = (payload as { type?: string }).type;
  return typeof type === "string" && type.startsWith("agent:");
};

export const safeJsonParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
