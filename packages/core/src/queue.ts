import type { QueueItem, RiskSignals } from "./models";

export const computePriority = (signals: RiskSignals): number => {
  let priority = 0;
  if (signals.breached) {
    priority += 200;
  }
  if (signals.reused) {
    priority += 80;
  }
  if (signals.weak) {
    priority += 60;
  }
  if (signals.old) {
    priority += 40;
  }
  priority += Math.round(signals.score / 5);
  return priority;
};

export const buildQueue = (items: Omit<QueueItem, "priority">[]): QueueItem[] =>
  [...items]
    .map((item) => ({
      ...item,
      priority: computePriority(item.signals)
    }))
    .sort((a, b) => b.priority - a.priority);
