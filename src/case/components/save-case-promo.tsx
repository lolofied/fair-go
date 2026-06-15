import { useState } from "react";
import { AlertTriangle, CheckCircle, Download01, UploadCloud02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { PasswordField, TextField } from "@/case/components/fields";
import { GuardrailBanner } from "@/case/components/guardrail";
import { useCase } from "@/case/store";
import { SyncAuthError, useSync } from "@/case/sync/sync-provider";

function needsBackup(lastBackupAt: string | undefined, updatedAt: string): boolean {
    if (!lastBackupAt) return true;
    return new Date(updatedAt).getTime() > new Date(lastBackupAt).getTime();
}

/**
 * Combined back-up + create-account callout for the overview dashboard.
 * Create account opens in a modal; sign-in stays in Settings.
 */
export const SaveCasePromo = () => {
    const { file } = useCase();
    const { configured, loading, user, dekUnlocked, syncStatus, lastSyncedAt, signUp, syncNow } = useSync();

    const [createOpen, setCreateOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [passphrase, setPassphrase] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
    const [savedRecovery, setSavedRecovery] = useState(false);

    if (!file || loading) return null;

    const hasBackup = Boolean(file.meta.lastBackupAt);
    const backupStale = needsBackup(file.meta.lastBackupAt, file.meta.updatedAt);
    const isSaved = configured && user && dekUnlocked;

    const resetCreateForm = () => {
        setEmail("");
        setPassphrase("");
        setConfirm("");
        setError(null);
    };

    const closeCreateModal = () => {
        setCreateOpen(false);
        setRecoveryKey(null);
        setSavedRecovery(false);
        resetCreateForm();
    };

    const onCreateAccount = async () => {
        setError(null);
        if (passphrase.length < 8) {
            setError("Use a passphrase of at least 8 characters.");
            return;
        }
        if (passphrase !== confirm) {
            setError("The passphrases don't match.");
            return;
        }

        setBusy(true);
        try {
            const { recoveryKey: key } = await signUp(email, passphrase, file);
            setRecoveryKey(key);
            resetCreateForm();
        } catch (e) {
            setError(e instanceof SyncAuthError ? e.message : e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setBusy(false);
        }
    };

    if (isSaved) {
        return (
            <section className="rounded-2xl border border-success bg-success-primary p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                        <CheckCircle className="size-5 shrink-0 text-fg-success-primary sm:size-6" aria-hidden="true" />
                        <div>
                            <h2 className="text-md font-semibold text-primary">Your case is saved</h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Signed in as <span className="font-medium text-secondary">{user.email}</span>
                                {lastSyncedAt && <> · Last synced {new Date(lastSyncedAt).toLocaleString("en-AU")}</>}
                            </p>
                            {!hasBackup && backupStale && (
                                <p className="mt-2 text-sm text-tertiary">
                                    Download an encrypted backup from Settings for an extra copy on your device.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                        <Button
                            color="secondary"
                            size="md"
                            iconLeading={UploadCloud02}
                            isLoading={syncStatus === "syncing"}
                            onClick={() => syncNow(file)}
                            className="w-full sm:w-auto"
                        >
                            Sync now
                        </Button>
                        {!hasBackup && (
                            <Button color="link-gray" size="sm" href="/case/settings" className="w-full sm:w-auto">
                                Download backup
                            </Button>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="rounded-2xl border border-warning bg-warning-primary p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                        <div>
                            <h2 className="text-md font-semibold text-primary">Back up your case</h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Your case lives only on this device until you save it.
                                {configured
                                    ? " Create a free encrypted sync account to retrieve it from anywhere, or download a local backup file."
                                    : " Download an encrypted backup so you don't lose it if your browser is cleared."}
                            </p>
                            {hasBackup && backupStale && (
                                <p className="mt-2 text-sm font-medium text-secondary">
                                    You have changes since your last backup — save again when you can.
                                </p>
                            )}
                            {user && !dekUnlocked && (
                                <p className="mt-2 text-sm text-tertiary">
                                    Already have an account?{" "}
                                    <a href="/case/settings#sync" className="font-medium text-brand-secondary underline-offset-2 hover:underline">
                                        Sign in via Settings
                                    </a>{" "}
                                    to unlock sync on this device.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:min-w-44">
                        {configured && !user && (
                            <Button color="primary" size="md" iconLeading={UploadCloud02} className="w-full" onClick={() => setCreateOpen(true)}>
                                Create account
                            </Button>
                        )}
                        <Button color="secondary" size="md" iconLeading={Download01} href="/case/settings" className="w-full">
                            Download backup
                        </Button>
                    </div>
                </div>
            </section>

            <ModalOverlay isOpen={createOpen} onOpenChange={(open) => !open && closeCreateModal()} isDismissable={!recoveryKey}>
                <Modal className="max-w-md">
                    <Dialog className="w-full items-center justify-center outline-hidden">
                        <div className="w-full rounded-2xl border border-secondary bg-primary p-6 shadow-xl sm:p-8">
                            {recoveryKey ? (
                                <>
                                    <h2 className="text-display-xs font-semibold text-primary">Save your recovery key</h2>
                                    <GuardrailBanner tone="warning" title="This is the only way to recover your account" className="my-4">
                                        If you forget your passphrase, this recovery key is the only way back in. We cannot reset it
                                        for you. Store it somewhere safe, separate from your passphrase.
                                    </GuardrailBanner>
                                    <p className="break-all rounded-lg border border-secondary bg-secondary px-3 py-2 font-mono text-sm text-primary">
                                        {recoveryKey}
                                    </p>
                                    <label className="mt-4 flex items-center gap-2 text-sm text-secondary">
                                        <input
                                            type="checkbox"
                                            checked={savedRecovery}
                                            onChange={(e) => setSavedRecovery(e.target.checked)}
                                            className="size-4 rounded border-primary"
                                        />
                                        I have saved my recovery key somewhere safe.
                                    </label>
                                    <Button color="primary" size="lg" className="mt-4 w-full" isDisabled={!savedRecovery} onClick={closeCreateModal}>
                                        Done
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-display-xs font-semibold text-primary">Create a sync account</h2>
                                    <p className="mt-2 text-sm text-tertiary">
                                        Use a personal email only. Your case is encrypted before it leaves this device — we only store
                                        ciphertext we cannot read.
                                    </p>
                                    <div className="mt-5 grid gap-4">
                                        <TextField label="Personal email" value={email} onChange={setEmail} placeholder="you@example.com" />
                                        <PasswordField label="Passphrase" value={passphrase} onChange={setPassphrase} placeholder="At least 8 characters" />
                                        <PasswordField label="Confirm passphrase" value={confirm} onChange={setConfirm} />
                                    </div>
                                    {error && <p className="mt-3 text-sm text-error-primary">{error}</p>}
                                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                        <Button color="secondary" size="md" className="w-full sm:w-auto" onClick={closeCreateModal}>
                                            Cancel
                                        </Button>
                                        <Button
                                            color="primary"
                                            size="md"
                                            iconLeading={UploadCloud02}
                                            className="w-full sm:w-auto"
                                            isLoading={busy}
                                            onClick={onCreateAccount}
                                        >
                                            Create account and save
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
};
