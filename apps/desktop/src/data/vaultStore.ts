import {
  analyzePassword,
  buildQueue,
  buildRiskSignals,
  findReusedAccountIds,
  type RiskSignals
} from "@password-cluster/core";

export type VaultAccount = {
  id: string;
  domain: string;
  username: string;
  password: string;
  breached?: boolean;
  lastRotatedAt?: string;
  mode: "auto" | "guided" | "manual" | "blocked";
};

export type VaultSnapshot = {
  accounts: VaultAccount[];
};

const seedAccounts: VaultAccount[] = [
  {
    id: "acct-001",
    domain: "acme-mail.example",
    username: "mira@acme.com",
    password: "Summer2023!",
    breached: true,
    lastRotatedAt: "2024-05-10",
    mode: "guided"
  },
  {
    id: "acct-002",
    domain: "workboard.example",
    username: "ops@workboard",
    password: "Summer2023!",
    breached: false,
    lastRotatedAt: "2023-12-01",
    mode: "manual"
  },
  {
    id: "acct-003",
    domain: "shophub.example",
    username: "mira@shop",
    password: "Sh0p#2024",
    breached: false,
    lastRotatedAt: "2024-09-12",
    mode: "auto"
  },
  {
    id: "acct-004",
    domain: "newsroom.example",
    username: "team@news",
    password: "newsroom",
    breached: false,
    lastRotatedAt: "2022-11-03",
    mode: "blocked"
  },
  {
    id: "acct-005",
    domain: "localhost",
    username: "demo@password.cluster",
    password: "OldPass!234",
    breached: false,
    lastRotatedAt: "2024-01-20",
    mode: "auto"
  }
];

export const createSeedSnapshot = (): VaultSnapshot => ({
  accounts: seedAccounts
});

export const generatePassword = (length = 16): string => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
};

const fingerprint = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000000007;
  }
  return `fp-${hash}`;
};

export type VaultComputed = {
  accounts: VaultAccount[];
  signalsById: Map<string, RiskSignals>;
  queue: ReturnType<typeof buildQueue>;
  riskSummary: {
    breached: number;
    reused: number;
    weak: number;
    old: number;
  };
};

export const computeVault = (snapshot: VaultSnapshot): VaultComputed => {
  const reusedSet = findReusedAccountIds(
    snapshot.accounts.map((account) => ({
      accountId: account.id,
      fingerprint: fingerprint(account.password)
    }))
  );

  const signalsById = new Map<string, RiskSignals>();
  const queueItems = snapshot.accounts.map((account) => {
    const analysis = analyzePassword(account.password);
    const signals = buildRiskSignals({
      analysis,
      reused: reusedSet.has(account.id),
      breached: account.breached ?? false,
      lastRotatedAt: account.lastRotatedAt
    });

    signalsById.set(account.id, signals);

    return {
      accountId: account.id,
      domain: account.domain,
      mode: account.mode,
      signals
    };
  });

  const queue = buildQueue(queueItems);

  const riskSummary = {
    breached: queueItems.filter((item) => item.signals.breached).length,
    reused: queueItems.filter((item) => item.signals.reused).length,
    weak: queueItems.filter((item) => item.signals.weak).length,
    old: queueItems.filter((item) => item.signals.old).length
  };

  return { accounts: snapshot.accounts, signalsById, queue, riskSummary };
};

export const updateAccountPassword = (
  snapshot: VaultSnapshot,
  accountId: string,
  newPassword: string
): VaultSnapshot => {
  return {
    accounts: snapshot.accounts.map((account) =>
      account.id === accountId
        ? { ...account, password: newPassword, lastRotatedAt: new Date().toISOString() }
        : account
    )
  };
};

export const getPrimaryRiskLabel = (signals: RiskSignals): string => {
  if (signals.breached) return "Breached";
  if (signals.reused) return "Reused";
  if (signals.weak) return "Weak";
  if (signals.old) return "Old";
  return "Safe";
};

export const getPrimaryRiskTone = (signals: RiskSignals): "risk" | "warn" | "neutral" => {
  if (signals.breached) return "risk";
  if (signals.reused || signals.weak) return "warn";
  if (signals.old) return "neutral";
  return "neutral";
};
