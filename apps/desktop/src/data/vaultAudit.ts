export type VaultAuditEvent = {
  id: string;
  type: "vault_wipe" | "vault_lock" | "vault_unlock";
  timestamp: string;
  detail?: string;
};

const STORAGE_KEY = "pc_vault_audit_v1";

const safeParse = (raw: string | null): VaultAuditEvent[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VaultAuditEvent[]) : [];
  } catch {
    return [];
  }
};

export const listVaultEvents = (): VaultAuditEvent[] => {
  return safeParse(localStorage.getItem(STORAGE_KEY));
};

export const recordVaultEvent = (event: VaultAuditEvent) => {
  const current = listVaultEvents();
  const next = [event, ...current].slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};
