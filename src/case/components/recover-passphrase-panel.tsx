import { useState } from "react";
import { Key01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { PasswordField, TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { SyncAuthError, useSync } from "@/case/sync/sync-provider";

export const RecoverPassphrasePanel = ({ className }: { className?: string }) => {
    const { recoverPassphrase } = useSync();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [recoveryKey, setRecoveryKey] = useState("");
    const [newPassphrase, setNewPassphrase] = useState("");
    const [confirmPassphrase, setConfirmPassphrase] = useState("");

    const reset = () => {
        setOpen(false);
        setError(null);
        setRecoveryKey("");
        setNewPassphrase("");
        setConfirmPassphrase("");
    };

    const onSubmit = async () => {
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
            await recoverPassphrase(email, recoveryKey, newPassphrase);
            setSuccess("Passphrase updated. You can sign in with your new passphrase.");
            reset();
        } catch (e) {
            setError(e instanceof SyncAuthError ? e.message : e instanceof Error ? e.message : "Recovery failed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div id="recover" className={className}>
            <h3 className="text-sm font-semibold text-primary">Forgot your passphrase?</h3>
            <p className="mt-2 text-sm text-tertiary">
                Use the recovery key you saved at signup. We cannot reset your passphrase or read your encrypted case.
            </p>
            {success && <p className="mt-3 text-sm text-success-primary">{success}</p>}
            {!open ? (
                <Button color="link-gray" size="sm" className="mt-3" onClick={() => setOpen(true)}>
                    Recover with recovery key
                </Button>
            ) : (
                <div className="mt-4">
                    <GuardrailBanner tone="warning" title="Recovery key required" className="mb-4">
                        Email password reset cannot recover your encryption key. Without your recovery key, your encrypted sync
                        data cannot be unlocked.
                    </GuardrailBanner>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Account email" value={email} onChange={setEmail} placeholder="you@example.com" />
                        <TextField label="Recovery key" value={recoveryKey} onChange={setRecoveryKey} placeholder="From signup" />
                        <PasswordField label="New passphrase" value={newPassphrase} onChange={setNewPassphrase} />
                        <PasswordField label="Confirm new passphrase" value={confirmPassphrase} onChange={setConfirmPassphrase} />
                    </div>
                    {error && <p className="mt-3 text-sm text-error-primary">{error}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="md" color="primary" iconLeading={Key01} isLoading={busy} onClick={onSubmit}>
                            Set new passphrase
                        </Button>
                        <Button size="md" color="secondary" onClick={reset}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
