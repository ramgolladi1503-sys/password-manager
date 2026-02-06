export type RiskPolicy = {
  minLength: number;
  minEntropy: number;
  maxAgeDays: number;
};

export const DEFAULT_RISK_POLICY: RiskPolicy = {
  minLength: 12,
  minEntropy: 50,
  maxAgeDays: 180
};
