import { describe, expect, it } from "vitest";
import { buildQueue } from "../src/queue";

const item = (id: string, signals: any) => ({
  accountId: id,
  domain: "example.com",
  mode: "guided" as const,
  signals
});

describe("queue", () => {
  it("prioritizes breached first", () => {
    const queue = buildQueue([
      item("1", { breached: false, reused: true, weak: true, old: false, score: 40, ageDays: 10 }),
      item("2", { breached: true, reused: false, weak: false, old: false, score: 20, ageDays: 5 })
    ]);

    expect(queue[0].accountId).toBe("2");
  });
});
