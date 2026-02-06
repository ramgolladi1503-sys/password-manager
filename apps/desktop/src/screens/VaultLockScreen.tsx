import { useState, type FormEvent } from "react";

type Props = {
  needsSetup: boolean;
  loading: boolean;
  error: string | null;
  onUnlock: (password: string) => Promise<boolean>;
  onSetup: (password: string) => Promise<boolean>;
  onWipe: () => void;
};

export const VaultLockScreen = ({
  needsSetup,
  loading,
  error,
  onUnlock,
  onSetup,
  onWipe
}: Props) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetPhrase, setResetPhrase] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError("");
    if (needsSetup) {
      if (password.length < 10) {
        setLocalError("Master password must be at least 10 characters.");
        return;
      }
      if (password !== confirm) {
        setLocalError("Passwords do not match.");
        return;
      }
      await onSetup(password);
      return;
    }
    await onUnlock(password);
  };

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-header">
          <div className="lock-badge">Password Cluster</div>
          <h1>{needsSetup ? "Create your master key" : "Unlock your vault"}</h1>
          <p className="muted">
            {needsSetup
              ? "Set a master password to encrypt your vault on this device."
              : "Enter your master password to decrypt and access the vault."}
          </p>
        </div>

        <form className="lock-form" onSubmit={handleSubmit}>
          <label>
            {needsSetup ? "Master password" : "Master password"}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 10 characters"
              required
            />
          </label>
          {needsSetup ? (
            <label>
              Confirm password
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Re-enter master password"
                required
              />
            </label>
          ) : null}

          {localError ? <div className="form-error">{localError}</div> : null}
          {error ? <div className="form-error">{error}</div> : null}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading
              ? "Working..."
              : needsSetup
              ? "Create vault"
              : "Unlock vault"}
          </button>
        </form>

        <div className="lock-footnote">
          <p className="muted">
            Your master password never leaves this device. If you forget it, you must reset this
            vault and re-import your data.
          </p>
          {!needsSetup ? (
            <div className="lock-reset">
              <button
                className="btn ghost"
                type="button"
                onClick={() => setShowReset((prev) => !prev)}
              >
                Forgot master password?
              </button>
              {showReset ? (
                <div className="lock-reset-panel">
                  <p className="muted">
                    This will permanently erase the encrypted vault on this device.
                  </p>
                  <label>
                    Type WIPE to confirm
                    <input
                      value={resetPhrase}
                      onChange={(event) => setResetPhrase(event.target.value)}
                      placeholder="WIPE"
                    />
                  </label>
                  <button
                    className="btn primary"
                    type="button"
                    onClick={() => {
                      if (resetPhrase.trim() !== "WIPE") {
                        setLocalError("Confirmation phrase must be WIPE.");
                        return;
                      }
                      onWipe();
                    }}
                  >
                    Wipe vault
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
