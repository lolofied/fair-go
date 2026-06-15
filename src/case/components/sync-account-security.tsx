import { useState } from "react";
import { Key01, RefreshCw01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { PasswordField, TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { SyncAuthError, useSync } from "@/case/sync/sync-provider";

type Panel = "change" | "recover" | null;

export const SyncAccountSecurity = () => {
    const { user, dekUnlocked, changePassphrase, recoverPassphrase } = useSync();

    const [panel, setPanel] = useState<Panel>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [currentPassphrase, setCurrentPassphrase] = useState("");
    const [newPassphrase, setNewPassphrase] = useState("");
    const [confirmPassphrase, setConfirmPassphrase] = useState("");

    const [recoverEmail, setRecoverEmail] = useState("");
    const [recoveryKey, setRecoveryKey] = useState("");

    if (!user) {
        return (
            <div className="mt-6 border-t border-secondary pt-6">
                <h3 className="text-sm font-semibold text-primary">Forgot your passphrase?</h3>
                <p className="mt-2 text-sm text-tertiary">
                    Use the recovery key you saved at signup. We cannot reset your passphrase or read your encrypted case.
                </p>
                {panel !== "recover" ? (
                    <Button color="link-gray" size="sm" className="mt-3" onClick={() => setPanel("recover")}>
                        Recover with recovery key
                    </Button>
                ) : (
                    <RecoverForm
                        email={recoverEmail}
                        recoveryKey={recoveryKey}
                        newPassphrase={newPassphrase}
                        confirmPassphrase={confirmPassphrase}
                        busy={busy}
                        error={error}
                        success={success}
                        onEmailChange={setRecoverEmail}
                        onRecoveryKeyChange={setRecoveryKey}
                        onNewPassphraseChange={setNewPassphrase}
                        onConfirmPassphraseChange={setConfirmPassphrase}
                        onCancel={() => {
                            setPanel(null);
                            setError(null);
                            setSuccess(null);
                        }}
                        onSubmit={async () => {
                            setError(null);
                            setSuccess(null);
                            if (newPassphrase.length < 8) {
                                setError("Use a passphrase of at least 8 characters.");
                                return;
                            }
                            if (newPassphrase !== confirmPassphrase) {
                                setError("The new passphrases don't match.");
                                return;
                            }
                            setBusy(true);
                            try {
                                await recoverPassphrase(recoverEmail, recoveryKey, newPassphrase);
                                setSuccess("Passphrase updated. You are signed in with your new passphrase.");
                                setPanel(null);
                                setRecoveryKey("");
                                setNewPassphrase("");
                                setConfirmPassphrase("");
                            } catch (e) {
                                setError(e instanceof SyncAuthError ? e.message : e instanceof Error ? e.message : "Recovery failed.");
                            } finally {
                                setBusy(false);
                            }
                        }}
                    />
                )}
            </div>
        );
    }

    if (!dekUnlocked) return null;

    return (
        <div className="mt-6 border-t border-secondary pt-6">
            <h3 className="text-sm font-semibold text-primary">Passphrase and recovery</h3>
            <p className="mt-2 text-sm text-tertiary">
                Change your sync passphrase without re-encrypting your case. Your recovery key still works afterward.
            </p>

            {success && <p className="mt-3 text-sm text-success-primary">{success}</p>}
            {error && panel === null && <p className="mt-3 text-sm text-error-primary">{error}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
                <Button
                    size="sm"
                    color={panel === "change" ? "primary" : "secondary"}
                    iconLeading={RefreshCw01}
                    onClick={() => {
                        setPanel(panel === "change" ? null : "change");
                        setError(null);
                        setSuccess(null);
                    }}
                >
                    Change passphrase
                </Button>
            </div>

            {panel === "change" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <PasswordField label="Current passphrase" value={currentPassphrase} onChange={setCurrentPassphrase} />
                    <PasswordField label="New passphrase" value={newPassphrase} onChange={setNewPassphrase} />
                    <PasswordField label="Confirm new passphrase" value={confirmPassphrase} onChange={setConfirmPassphrase} />
                    {error && <p className="sm:col-span-2 text-sm text-error-primary">{error}</p>}
                    <div className="sm:col-span-2">
                        <Button
                            size="md"
                            color="primary"
                            iconLeading={Key01}
                            isLoading={busy}
                            onClick={async () => {
                                setError(null);
                                setSuccess(null);
                                if (newPassphrase.length < 8) {
                                    setError("Use a passphrase of at least 8 characters.");
                                    return;
                                }
                                if (newPassphrase !== confirmPassphrase) {
                                    setError("The new passphrases don't match.");
                                    return;
                                }
                                setBusy(true);
                                try {
                                    await changePassphrase(user.email ?? "", currentPassphrase, newPassphrase);
                                    setSuccess("Passphrase updated. Use your new passphrase next time you unlock encryption.");
                                    setPanel(null);
                                    setCurrentPassphrase("");
                                    setNewPassphrase("");
                                    setConfirmPassphrase("");
                                } catch (e) {
                                    setError(
                                        e instanceof SyncAuthError ? e.message : e instanceof Error ? e.message : "Could not change passphrase.",
                                    );
                                } finally {
                                    setBusy(false);
                                }
                            }}
                        >
                            Update passphrase
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

function RecoverForm({
    email,
    recoveryKey,
    newPassphrase,
    confirmPassphrase,
    busy,
    error,
    success,
    onEmailChange,
    onRecoveryKeyChange,
    onNewPassphraseChange,
    onConfirmPassphraseChange,
    onCancel,
    onSubmit,
}: {
    email: string;
    recoveryKey: string;
    newPassphrase: string;
    confirmPassphrase: string;
    busy: boolean;
    error: string | null;
    success: string | null;
    onEmailChange: (v: string) => void;
    onRecoveryKeyChange: (v: string) => void;
    onNewPassphraseChange: (v: string) => void;
    onConfirmPassphraseChange: (v: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
}) {
    return (
        <div className="mt-4">
            <GuardrailBanner tone="warning" title="Recovery key required" className="mb-4">
                Supabase email password reset cannot recover your encryption key. Without your recovery key, your encrypted
                sync data cannot be unlocked.
            </GuardrailBanner>
            <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Account email" value={email} onChange={onEmailChange} placeholder="you@example.com" />
                <TextField label="Recovery key" value={recoveryKey} onChange={onRecoveryKeyChange} placeholder="From signup" />
                <PasswordField label="New passphrase" value={newPassphrase} onChange={onNewPassphraseChange} />
                <PasswordField label="Confirm new passphrase" value={confirmPassphrase} onChange={onConfirmPassphraseChange} />
            </div>
            {error && <p className="mt-3 text-sm text-error-primary">{error}</p>}
            {success && <p className="mt-3 text-sm text-success-primary">{success}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
                <Button size="md" color="primary" iconLeading={Key01} isLoading={busy} onClick={onSubmit}>
                    Set new passphrase
                </Button>
                <Button size="md" color="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
