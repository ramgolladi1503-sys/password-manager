import type { VaultSnapshot } from "./vaultStore";

export type EncryptedVaultPayload = {
  version: 1;
  salt: string;
  iv: string;
  data: string;
  updatedAt: string;
};

const STORAGE_KEY = "password_cluster_vault_enc_v1";
const LEGACY_STORAGE_KEY = "password_cluster_vault_v1";
const PBKDF2_ITERATIONS = 210000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const normalizePassword = (password: string | Uint8Array) => {
  if (typeof password === "string") {
    return encoder.encode(password);
  }
  return new Uint8Array(password);
};

const deriveKey = async (password: string | Uint8Array, salt: Uint8Array) => {
  const passwordBytes = normalizePassword(password);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const hasEncryptedVault = () => Boolean(localStorage.getItem(STORAGE_KEY));

export const loadEncryptedVault = (): EncryptedVaultPayload | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EncryptedVaultPayload;
  } catch {
    return null;
  }
};

export const saveEncryptedVault = (payload: EncryptedVaultPayload) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const clearEncryptedVault = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const loadLegacyVault = (): VaultSnapshot | null => {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VaultSnapshot;
  } catch {
    return null;
  }
};

export const clearLegacyVault = () => {
  localStorage.removeItem(LEGACY_STORAGE_KEY);
};

export const encryptVault = async (
  snapshot: VaultSnapshot,
  password: string | Uint8Array
): Promise<EncryptedVaultPayload> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt);
  const plaintext = encoder.encode(JSON.stringify(snapshot));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    version: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(ciphertext)),
    updatedAt: new Date().toISOString()
  };
};

export const decryptVault = async (
  payload: EncryptedVaultPayload,
  password: string | Uint8Array
): Promise<VaultSnapshot> => {
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const data = fromBase64(payload.data);
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  const decoded = decoder.decode(plaintext);
  return JSON.parse(decoded) as VaultSnapshot;
};
