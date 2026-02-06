export type Account = {
  id: string;
  domain: string;
  username: string;
  passwordFingerprint?: string;
  lastRotatedAt?: string;
  createdAt?: string;
  breached?: boolean;
};

export type PasswordAnalysis = {
  length: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  charsetSize: number;
  entropy: number;
};

export type RiskSignals = {
  weak: boolean;
  reused: boolean;
  breached: boolean;
  old: boolean;
  score: number;
  ageDays: number;
};

export type QueueMode = "auto" | "guided" | "manual" | "blocked";

export type QueueItem = {
  accountId: string;
  domain: string;
  priority: number;
  mode: QueueMode;
  signals: RiskSignals;
};
