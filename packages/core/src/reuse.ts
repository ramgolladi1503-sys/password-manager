export type FingerprintEntry = {
  accountId: string;
  fingerprint?: string;
};

export const findReusedAccountIds = (entries: FingerprintEntry[]): Set<string> => {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (entry.fingerprint) {
      counts.set(entry.fingerprint, (counts.get(entry.fingerprint) ?? 0) + 1);
    }
  }

  const reused = new Set<string>();
  for (const entry of entries) {
    if (entry.fingerprint && (counts.get(entry.fingerprint) ?? 0) > 1) {
      reused.add(entry.accountId);
    }
  }

  return reused;
};
