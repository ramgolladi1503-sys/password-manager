import { describe, expect, it } from "vitest";
import { analyzePassword, buildRiskSignals } from "../src/risk";
import { DEFAULT_RISK_POLICY } from "../src/policy";

const policy = DEFAULT_RISK_POLICY;

describe("risk analysis", () => {
  it("flags weak password", () => {
    const analysis = analyzePassword("abc123");
    const signals = buildRiskSignals({
      analysis,
      reused: false,
      breached: false,
      lastRotatedAt: "2025-01-01",
      policy
    });

    expect(signals.weak).toBe(true);
  });

  it("flags old password", () => {
    const analysis = analyzePassword("StrongPassw0rd!@");
    const signals = buildRiskSignals({
      analysis,
      reused: false,
      breached: false,
      lastRotatedAt: "2020-01-01",
      policy
    });

    expect(signals.old).toBe(true);
  });
});
