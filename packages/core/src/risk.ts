import { DEFAULT_RISK_POLICY, type RiskPolicy } from "./policy";
import type { PasswordAnalysis, RiskSignals } from "./models";

export const analyzePassword = (password: string): PasswordAnalysis => {
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const charsetSize =
    (hasLower ? 26 : 0) +
    (hasUpper ? 26 : 0) +
    (hasDigit ? 10 : 0) +
    (hasSymbol ? 33 : 0);

  const entropy = charsetSize > 0 ? length * Math.log2(charsetSize) : 0;

  return {
    length,
    hasLower,
    hasUpper,
    hasDigit,
    hasSymbol,
    charsetSize,
    entropy
  };
};

export const scorePassword = (
  analysis: PasswordAnalysis,
  policy: RiskPolicy = DEFAULT_RISK_POLICY
): { score: number; weak: boolean } => {
  const lengthScore = Math.min(50, (analysis.length / policy.minLength) * 50);
  const entropyScore = Math.min(50, (analysis.entropy / policy.minEntropy) * 50);
  const score = Math.round(lengthScore + entropyScore);
  const weak = analysis.length < policy.minLength || analysis.entropy < policy.minEntropy;

  return { score, weak };
};

export const computeAgeDays = (isoDate?: string, now = new Date()): number => {
  if (!isoDate) {
    return 0;
  }
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) {
    return 0;
  }
  const diffMs = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

export const buildRiskSignals = (params: {
  analysis: PasswordAnalysis;
  reused: boolean;
  breached: boolean;
  lastRotatedAt?: string;
  policy?: RiskPolicy;
}): RiskSignals => {
  const policy = params.policy ?? DEFAULT_RISK_POLICY;
  const { score, weak } = scorePassword(params.analysis, policy);
  const ageDays = computeAgeDays(params.lastRotatedAt);
  const old = ageDays >= policy.maxAgeDays;

  return {
    weak,
    reused: params.reused,
    breached: params.breached,
    old,
    score,
    ageDays
  };
};
