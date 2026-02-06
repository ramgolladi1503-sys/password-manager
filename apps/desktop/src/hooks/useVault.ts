import { useEffect, useMemo, useRef, useState } from "react";
import {
  computeVault,
  createSeedSnapshot,
  updateAccountPassword,
  type VaultComputed,
  type VaultSnapshot
} from "../data/vaultStore";
import { recordVaultEvent } from "../data/vaultAudit";
import {
  decryptVault,
  encryptVault,
  hasEncryptedVault,
  clearEncryptedVault,
  loadLegacyVault,
  clearLegacyVault,
  loadEncryptedVault,
  saveEncryptedVault
} from "../data/vaultEncryption";

const AUTOLOCK_KEY = "pc_vault_autolock_minutes";
const encoder = new TextEncoder();

export const useVault = () => {
  const [snapshot, setSnapshot] = useState<VaultSnapshot | null>(null);
  const [locked, setLocked] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(() => !hasEncryptedVault());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() => {
    const raw = localStorage.getItem(AUTOLOCK_KEY);
    const parsed = raw ? Number(raw) : 5;
    return Number.isFinite(parsed) ? parsed : 5;
  });
  const masterKeyRef = useRef<Uint8Array | null>(null);
  const lastActivityRef = useRef(Date.now());

  const computed: VaultComputed = useMemo(
    () => computeVault(snapshot ?? { accounts: [] }),
    [snapshot]
  );

  useEffect(() => {
    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener("mousemove", markActivity, { passive: true });
    window.addEventListener("keydown", markActivity);
    window.addEventListener("click", markActivity);
    window.addEventListener("scroll", markActivity, { passive: true });
    return () => {
      window.removeEventListener("mousemove", markActivity);
      window.removeEventListener("keydown", markActivity);
      window.removeEventListener("click", markActivity);
      window.removeEventListener("scroll", markActivity);
    };
  }, []);

  useEffect(() => {
    if (locked || autoLockMinutes <= 0) {
      return;
    }
    const interval = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= autoLockMinutes * 60 * 1000) {
        lock();
      }
    }, 10000);
    return () => window.clearInterval(interval);
  }, [locked, autoLockMinutes]);

  const persist = async (next: VaultSnapshot) => {
    setSnapshot(next);
    if (!masterKeyRef.current) return;
    const payload = await encryptVault(next, masterKeyRef.current);
    saveEncryptedVault(payload);
  };

  const setPassword = (accountId: string, newPassword: string) => {
    if (!snapshot) return;
    void persist(updateAccountPassword(snapshot, accountId, newPassword));
  };

  const unlock = async (password: string) => {
    setLoading(true);
    setError(null);
    const payload = loadEncryptedVault();
    if (!payload) {
      setNeedsSetup(true);
      setLocked(true);
      setLoading(false);
      return false;
    }
    try {
      const passwordBytes = encoder.encode(password);
      const decrypted = await decryptVault(payload, passwordBytes);
      setSnapshot(decrypted);
      if (masterKeyRef.current) {
        masterKeyRef.current.fill(0);
      }
      masterKeyRef.current = passwordBytes;
      setLocked(false);
      setNeedsSetup(false);
      lastActivityRef.current = Date.now();
      return true;
    } catch {
      setError("Invalid master password.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setup = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const legacy = loadLegacyVault();
      const seed = legacy ?? createSeedSnapshot();
      const passwordBytes = encoder.encode(password);
      const payload = await encryptVault(seed, passwordBytes);
      saveEncryptedVault(payload);
      if (legacy) {
        clearLegacyVault();
      }
      setSnapshot(seed);
      if (masterKeyRef.current) {
        masterKeyRef.current.fill(0);
      }
      masterKeyRef.current = passwordBytes;
      setLocked(false);
      setNeedsSetup(false);
      lastActivityRef.current = Date.now();
      return true;
    } catch {
      setError("Failed to initialize vault.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const lock = () => {
    setSnapshot(null);
    if (masterKeyRef.current) {
      masterKeyRef.current.fill(0);
    }
    masterKeyRef.current = null;
    setLocked(true);
  };

  const wipeVault = () => {
    clearEncryptedVault();
    clearLegacyVault();
    setSnapshot(null);
    if (masterKeyRef.current) {
      masterKeyRef.current.fill(0);
    }
    masterKeyRef.current = null;
    setLocked(true);
    setNeedsSetup(true);
    setError(null);
    recordVaultEvent({
      id: `wipe-${Date.now()}`,
      type: "vault_wipe",
      timestamp: new Date().toISOString(),
      detail: "User initiated"
    });
  };

  const refresh = async () => {
    if (!masterKeyRef.current) return;
    const payload = loadEncryptedVault();
    if (!payload) {
      setNeedsSetup(true);
      setLocked(true);
      return;
    }
    try {
      const decrypted = await decryptVault(payload, masterKeyRef.current);
      setSnapshot(decrypted);
    } catch {
      setError("Vault refresh failed. Please unlock again.");
      setLocked(true);
    }
  };

  return {
    snapshot: snapshot ?? { accounts: [] },
    ...computed,
    locked,
    needsSetup,
    loading,
    error,
    autoLockMinutes,
    unlock,
    setup,
    lock,
    wipeVault,
    setAutoLockMinutes: (minutes: number) => {
      setAutoLockMinutesState(minutes);
      localStorage.setItem(AUTOLOCK_KEY, String(minutes));
    },
    setPassword,
    refresh
  };
};
