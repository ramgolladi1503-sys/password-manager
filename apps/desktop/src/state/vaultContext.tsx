import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useVault } from "../hooks/useVault";
import type { VaultAccount, VaultComputed, VaultSnapshot } from "../data/vaultStore";

export type VaultContextState = VaultComputed & {
  snapshot: VaultSnapshot;
  locked: boolean;
  needsSetup: boolean;
  loading: boolean;
  error: string | null;
  autoLockMinutes: number;
  unlock: (password: string) => Promise<boolean>;
  setup: (password: string) => Promise<boolean>;
  lock: () => void;
  wipeVault: () => void;
  setAutoLockMinutes: (minutes: number) => void;
  setPassword: (accountId: string, newPassword: string) => void;
  refresh: () => Promise<void>;
};

const VaultContext = createContext<VaultContextState | null>(null);

export const VaultProvider = ({ children }: { children: ReactNode }) => {
  const vault = useVault();
  return <VaultContext.Provider value={vault}>{children}</VaultContext.Provider>;
};

export const useVaultContext = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("Vault context unavailable");
  }
  return context;
};
